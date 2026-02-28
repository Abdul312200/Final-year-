import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useMarket } from '../context/MarketContext';
import images from '../assets';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.fintechiq.me';

// Fetch live gold price (INR / 10g) from our backend → yfinance GC=F
const useGoldRate = () => {
  const [gold, setGold] = useState({ price: null, chp: null, loading: true, error: false });

  useEffect(() => {
    const fetchGold = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/gold`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setGold({ price: data.price, chp: data.chp, loading: false, error: false });
      } catch {
        setGold(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchGold();
    const id = setInterval(fetchGold, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(id);
  }, []);

  return gold;
};

const formatINR = (n) =>
  n != null ? '₹' + n.toLocaleString('en-IN') : '—';

export default function MarketIndicator() {
  const { data, loading, isBull } = useMarket();
  const { lang } = useLanguage();
  const gold = useGoldRate();

  const labels = {
    en: { trend: 'Market Trend', vol: 'Volume', idx: 'Index', vix: 'Volatility', analyzing: 'Analyzing...' },
    ta: { trend: 'சந்தை போக்கு', vol: 'அளவு', idx: 'குறியீடு', vix: 'ஏற்ற இறக்கம்', analyzing: 'பகுப்பாய்வு...' },
  }[lang];

  // Gold display helpers
  const goldValue = gold.loading ? '...' : gold.error ? '—' : formatINR(gold.price);
  const goldChange = gold.chp != null
    ? (gold.chp >= 0 ? `▲ ${gold.chp.toFixed(2)}%` : `▼ ${Math.abs(gold.chp).toFixed(2)}%`)
    : null;
  const goldClass = gold.chp != null ? (gold.chp >= 0 ? 'up' : 'down') : 'up';

  return (
    <section className="market-section">
      <div className="container">
        {/* Bull/Bear circle */}
        <div>
          {loading || !data ? (
            <div className="indicator-circle loading">
              <div className="loading-spinner" />
              <div className="market-text">
                <div className="market-status loading">{labels.analyzing}</div>
              </div>
            </div>
          ) : (
            <div className={`indicator-circle ${isBull ? 'bull' : 'bear'}`}>
              <img src={isBull ? images.bullPng : images.bearLogo} alt={isBull ? 'Bull' : 'Bear'} className="market-animal" />
              <div className="market-text">
                <div className={`market-status ${isBull ? 'bull' : 'bear'}`}>
                  {lang === 'en' ? data.status : (isBull ? 'காளை' : 'கரடி')}
                </div>
                <div className="market-percentage">{isBull ? '▲' : '▼'} {data.percentage}%</div>
              </div>
            </div>
          )}
          <p className="market-subtext">{labels.trend}</p>
        </div>

        {/* Metric cards */}
        <div className="market-metrics">
          <div className="metric-card">
            <div className="metric-card-label">{labels.vol}</div>
            <div className="metric-card-val">₹4.2T</div>
            <div className="metric-card-sub up">▲ 3.1% today</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">{labels.idx} — NIFTY 50</div>
            <div className="metric-card-val">24,185</div>
            <div className={`metric-card-sub ${isBull || loading ? 'up' : 'down'}`}>
              {isBull || loading ? '▲ 0.87%' : '▼ 0.62%'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">{labels.idx} — S&P 500</div>
            <div className="metric-card-val">5,641</div>
            <div className="metric-card-sub up">▲ 0.43%</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">{labels.vix} — VIX</div>
            <div className="metric-card-val">18.4</div>
            <div className="metric-card-sub down">▼ Low Risk</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-label">USD / INR</div>
            <div className="metric-card-val">₹83.57</div>
            <div className="metric-card-sub down">▼ 0.12%</div>
          </div>

          {/* ── Live Gold Card ── */}
          <div className="metric-card metric-card--gold">
            <div className="metric-card-label">
              GOLD / 10g &nbsp;
              {gold.loading && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>fetching…</span>}
              {!gold.loading && !gold.error && (
                <span style={{ fontSize: '0.65rem', color: 'var(--bull)', fontWeight: 600 }}>● LIVE</span>
              )}
            </div>
            <div className="metric-card-val">{goldValue}</div>
            {goldChange && (
              <div className={`metric-card-sub ${goldClass}`}>{goldChange}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
