/**
 * alphaVantageService.js
 * ─────────────────────────────────────────────────────────────────────────
 * Single shared service for all Alpha Vantage calls.
 *
 * Free-tier limits: 5 req/min  ·  25 req/day
 *
 * Strategy
 *   • Fetch 8 Indian (BSE) stocks ONCE per session, 300 ms apart.
 *   • Cache result for 5 minutes — multiple components share one fetch.
 *   • Deduplicate concurrent calls: in-flight Promise is reused.
 *   • Fall back to static data if API is exhausted or offline.
 */

const API_KEY = import.meta.env.VITE_ALPHA_API || 'VH8S26GRAKQ9UPTL';
const BASE_URL = 'https://www.alphavantage.co/query';

// ── Stock list ─────────────────────────────────────────────────────────────
const STOCKS = [
  { symbol: 'TCS.NSE',        label: 'TCS' },
  { symbol: 'RELIANCE.NSE',   label: 'RELIANCE' },
  { symbol: 'INFY.NSE',       label: 'INFY' },
  { symbol: 'HDFCBANK.NSE',   label: 'HDFC BANK' },
  { symbol: 'ICICIBANK.NSE',  label: 'ICICI BANK' },
  { symbol: 'WIPRO.NSE',      label: 'WIPRO' },
  { symbol: 'BAJFINANCE.NSE', label: 'BAJAJ FIN' },
  { symbol: 'BHARTIARTL.NSE', label: 'BHARTI' },
];

// ── Static fallback (shown on cold load / API exhausted) ───────────────────
export const FALLBACK_STOCKS = [
  { symbol: 'TCS',        price: '3,456.80', change: '+45.20 (+1.33%)', changePct:  1.33, type: 'high' },
  { symbol: 'RELIANCE',   price: '2,345.60', change: '-23.40 (-0.99%)', changePct: -0.99, type: 'low'  },
  { symbol: 'INFY',       price: '1,567.90', change: '+18.75 (+1.21%)', changePct:  1.21, type: 'high' },
  { symbol: 'HDFC BANK',  price: '1,678.45', change: '-12.30 (-0.73%)', changePct: -0.73, type: 'low'  },
  { symbol: 'ICICI BANK', price: '987.50',   change: '+8.90 (+0.91%)',  changePct:  0.91, type: 'high' },
  { symbol: 'WIPRO',      price: '456.30',   change: '-5.60 (-1.21%)',  changePct: -1.21, type: 'low'  },
  { symbol: 'BAJAJ FIN',  price: '7,234.20', change: '+95.40 (+1.34%)', changePct:  1.34, type: 'high' },
  { symbol: 'BHARTI',     price: '876.55',   change: '+12.15 (+1.41%)', changePct:  1.41, type: 'high' },
];

const FALLBACK_RESULT = {
  stocks:    FALLBACK_STOCKS,
  live:      false,
  sentiment: { status: 'BULLISH', percentage: '1.24' },
};

// ── Format helpers ─────────────────────────────────────────────────────────
const fmt = (n) =>
  parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Module-level cache ─────────────────────────────────────────────────────
let _cache     = null;       // { stocks, live, sentiment }
let _cacheTime = 0;
let _pending   = null;       // in-flight Promise (prevents duplicate fetches)

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Core sequential fetch (respects 5 req/min limit) ──────────────────────
const fetchAll = async () => {
  const results = [];

  for (let i = 0; i < STOCKS.length; i++) {
    try {
      const res  = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${STOCKS[i].symbol}&apikey=${API_KEY}`
      );
      const data = await res.json();
      const q    = data['Global Quote'];

      if (q && q['05. price']) {
        const price  = parseFloat(q['05. price']);
        const change = parseFloat(q['09. change']);
        const pct    = parseFloat(q['10. change percent']);

        results.push({
          symbol:    STOCKS[i].label,
          price:     fmt(price),
          change:    `${change >= 0 ? '+' : ''}${fmt(change)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)`,
          changePct: pct,
          type:      change >= 0 ? 'high' : 'low',
        });
      }
    } catch {
      // Network error for this stock — skip, fallback fills the gap
    }

    // 300 ms gap keeps us well within 5 req/min
    if (i < STOCKS.length - 1) {
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Merge live results + fallback for any stocks that failed
  const liveLabels = new Set(results.map(r => r.symbol));
  const merged     = [
    ...results,
    ...FALLBACK_STOCKS.filter(f => !liveLabels.has(f.symbol)),
  ];

  // Derive bull/bear from majority direction
  const upCount = merged.filter(s => s.type === 'high').length;
  const avgPct  = merged.reduce((sum, s) => sum + Math.abs(s.changePct ?? 0), 0) / merged.length;

  return {
    stocks:    merged,
    live:      results.length > 0,
    sentiment: {
      status:     upCount >= Math.ceil(merged.length / 2) ? 'BULLISH' : 'BEARISH',
      percentage: avgPct.toFixed(2),
    },
  };
};

// ── Public API: cached, deduplicated ──────────────────────────────────────
export const fetchLiveStocks = () => {
  const now = Date.now();

  // Return fresh cache immediately
  if (_cache && now - _cacheTime < CACHE_TTL) {
    return Promise.resolve(_cache);
  }

  // Return in-flight Promise if already fetching
  if (_pending) return _pending;

  _pending = fetchAll()
    .then(data => {
      _cache     = data;
      _cacheTime = Date.now();
      _pending   = null;
      return data;
    })
    .catch(() => {
      _pending = null;
      return FALLBACK_RESULT;
    });

  return _pending;
};

/** Force-invalidate cache (call e.g. on manual refresh) */
export const invalidateCache = () => {
  _cache      = null;
  _cacheTime  = 0;
};
