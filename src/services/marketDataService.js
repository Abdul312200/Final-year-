/**
 * marketDataService.js
 * Fetches live quote data from Yahoo Finance.
 * Strategy: try direct → try CORS proxy → return static fallback.
 */

const YAHOO_BASE = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_LOCAL = 'http://127.0.0.1:5000/api/yahoo/v7/finance/quote';
const BACKEND_OVERVIEW = 'http://127.0.0.1:5000/api/market/overview';

// ── Helpers ──────────────────────────────────────────────────────────────

/** Format with Indian locale commas. */
const fmtIN = (val, decimals = 2) =>
  val != null
    ? Number(val).toLocaleString('en-IN', { maximumFractionDigits: decimals })
    : '--';

const TROY_OUNCE_TO_GRAM = 31.1034768;

/** Try fetch without proxy, then with CORS proxy. */
const safeFetch = async (url) => {
  // 1. Direct attempt
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return res.json();
  } catch (_) { /* CORS or network – fall through */ }

  // 2. Via corsproxy.io
  const proxied = await fetch(CORS_PROXY + encodeURIComponent(url), {
    signal: AbortSignal.timeout(8000),
  });
  if (!proxied.ok) throw new Error(`Proxy HTTP ${proxied.status}`);
  return proxied.json();
};

/** Fetch from your backend (recommended for production). */
const fetchBackendOverview = async () => {
  const res = await fetch(BACKEND_OVERVIEW, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Backend HTTP ${res.status}`);
  const payload = await res.json();

  // Normalize updatedAt into Date for UI formatting.
  return {
    ...payload,
    updatedAt: payload?.updatedAt ? new Date(payload.updatedAt) : new Date(),
  };
};

/** Try local dev proxy first (if available), then safeFetch() for direct+corsproxy. */
const fetchYahooJson = async (queryString) => {
  // 0. Local dev proxy (works only when running Vite dev server)
  try {
    const res = await fetch(`${YAHOO_LOCAL}${queryString}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) return res.json();
  } catch (_) { /* ignore and fall back */ }

  // 1. Direct (Node OK, browser often CORS blocked) → 2. corsproxy.io
  return safeFetch(`${YAHOO_BASE}${queryString}`);
};

// ── Main fetcher ──────────────────────────────────────────────────────────

/**
 * Returns { sentiment, stats, updatedAt, live }.
 * Falls back to a static snapshot if all fetch attempts fail.
 */
export const fetchAllMarketData = async () => {
  const queryString = `?lang=en&region=US&symbols=${SYMBOLS.join(',')}`;

  try {
    // 0. Best: your backend endpoint (production-safe)
    try {
      return await fetchBackendOverview();
    } catch (_) {
      // Ignore and fall back to direct Yahoo attempts.
    }

    const json = await fetchYahooJson(queryString);
    const quotes = json?.quoteResponse?.result ?? [];

    if (!quotes.length) throw new Error('Empty response');

    const get = (sym) => quotes.find((q) => q.symbol === sym) ?? {};

    const nifty = get('^NSEI');
    const sensex = get('^BSESN');
    const usdinr = get('INR=X');
    const gold = get('GC=F');
    const crude = get('CL=F');
    const silver = get('SI=F');

    const inrRate = usdinr.regularMarketPrice ?? 84;

    const combinedChangePercent = (assetQuote, fxQuote) => {
      const assetPct = Number(assetQuote?.regularMarketChangePercent ?? 0) / 100;
      const fxPct = Number(fxQuote?.regularMarketChangePercent ?? 0) / 100;
      const combined = (1 + assetPct) * (1 + fxPct) - 1;
      return combined * 100;
    };

    const pctCombinedStr = (assetQuote, fxQuote) =>
      Math.abs(combinedChangePercent(assetQuote, fxQuote)).toFixed(2) + '%';

    const posCombined = (assetQuote, fxQuote) =>
      combinedChangePercent(assetQuote, fxQuote) >= 0;

    const usdToInr = (usd) => (usd != null ? Number(usd) * Number(inrRate) : null);
    const usdOzToInrPer10g = (usdPerOz) => {
      if (usdPerOz == null) return null;
      const inrPerOz = usdToInr(usdPerOz);
      if (inrPerOz == null) return null;
      const inrPerGram = inrPerOz / TROY_OUNCE_TO_GRAM;
      return inrPerGram * 10;
    };

    /** Absolute % change string, e.g. "1.24%" */
    const pct = (q) =>
      Math.abs(q.regularMarketChangePercent ?? 0).toFixed(2) + '%';
    /** True if price went up today */
    const pos = (q) => (q.regularMarketChange ?? 0) >= 0;

    return {
      sentiment: {
        status: pos(nifty) ? 'BULLISH' : 'BEARISH',
        percentage: Math.abs(nifty.regularMarketChangePercent ?? 0).toFixed(2),
      },
      stats: [
        {
          icon: '📈',
          labelKey: { en: 'NIFTY 50', ta: 'நிஃப்டி 50' },
          value: fmtIN(nifty.regularMarketPrice, 0),
          change: pct(nifty),
          positive: pos(nifty),
        },
        {
          icon: '📊',
          labelKey: { en: 'SENSEX', ta: 'சென்செக்ஸ்' },
          value: fmtIN(sensex.regularMarketPrice, 0),
          change: pct(sensex),
          positive: pos(sensex),
        },
        {
          icon: '💱',
          labelKey: { en: 'USD / INR', ta: 'USD / INR' },
          value: '₹' + fmtIN(inrRate, 2),
          change: pct(usdinr),
          positive: !pos(usdinr),          // INR gaining = lower USD/INR
        },
        {
          icon: '🏆',
          labelKey: { en: 'GOLD /10g (INR)', ta: 'தங்கம் /10g (INR)' },
          value: '₹' + fmtIN(usdOzToInrPer10g(gold.regularMarketPrice), 0),
          change: pctCombinedStr(gold, usdinr),
          positive: posCombined(gold, usdinr),
        },
        {
          icon: '🛢️',
          labelKey: { en: 'CRUDE OIL (₹/bbl)', ta: 'கச்சா எண்ணெய் (₹/bbl)' },
          value: '₹' + fmtIN(usdToInr(crude.regularMarketPrice), 0),
          change: pctCombinedStr(crude, usdinr),
          positive: posCombined(crude, usdinr),
        },
        {
          icon: '💎',
          labelKey: { en: 'SILVER /10g (INR)', ta: 'வெள்ளி /10g (INR)' },
          value: '₹' + fmtIN(usdOzToInrPer10g(silver.regularMarketPrice), 0),
          change: pctCombinedStr(silver, usdinr),
          positive: posCombined(silver, usdinr),
        },
      ],
      updatedAt: new Date(),
      live: true,
    };

  } catch (err) {
    console.warn('[MarketData] Live fetch failed – using static fallback.', err.message);
    return getStaticFallback();
  }
};

// ── Static fallback (Feb 2026 estimates) ─────────────────────────────────

const getStaticFallback = () => ({
  sentiment: { status: 'BULLISH', percentage: '1.24' },
  stats: [
    { icon: '📈', labelKey: { en: 'NIFTY 50', ta: 'நிஃப்டி 50' }, value: '23,450', change: '1.2%', positive: true },
    { icon: '📊', labelKey: { en: 'SENSEX', ta: 'சென்செக்ஸ்' }, value: '77,180', change: '1.1%', positive: true },
    { icon: '💱', labelKey: { en: 'USD / INR', ta: 'USD / INR' }, value: '₹86.40', change: '0.2%', positive: false },
    { icon: '🏆', labelKey: { en: 'GOLD /10g (INR)', ta: 'தங்கம் /10g (INR)' }, value: '₹88,500', change: '0.8%', positive: true },
    { icon: '🛢️', labelKey: { en: 'CRUDE OIL (₹/bbl)', ta: 'கச்சா எண்ணெய் (₹/bbl)' }, value: '₹6,470', change: '1.5%', positive: false },
    { icon: '💎', labelKey: { en: 'SILVER /10g (INR)', ta: 'வெள்ளி /10g (INR)' }, value: '₹1,080', change: '0.6%', positive: true },
  ],
  updatedAt: new Date(),
  live: false,
});
