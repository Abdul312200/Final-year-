import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function fmt(v) {
  const n = Number(v);
  return isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0';
}
function fmtL(v) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${fmt(v)}`;
}
function calcCI(P, rate, years, n) {
  P = Math.max(0, +P || 0);
  const r = Math.max(0, +rate || 0) / 100;
  const t = Math.max(0, +years || 0);
  if (!t) return P;
  return P * Math.pow(1 + r / n, n * t);
}

function Slider({ label, value, display, min, max, step, onChange, minLabel, maxLabel, accent = '#f7971e' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="calc-slider-group">
      <div className="calc-slider-header">
        <span className="calc-slider-label">{label}</span>
        <span className="calc-slider-value" style={{ color: accent }}>{display}</span>
      </div>
      <div className="calc-slider-track-wrap">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          className="calc-range" style={{ '--pct': `${pct}%`, '--accent': accent }} />
      </div>
      <div className="calc-slider-minmax"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

const ACCENT = '#f7971e';
const ACCENT2 = '#11998e';
const GREY = '#94a3b8';

const FREQ_OPTIONS = [
  { v: 1, en: 'Yearly', ta: 'ஆண்டு' },
  { v: 4, en: 'Quarterly', ta: 'காலாண்டு' },
  { v: 12, en: 'Monthly', ta: 'மாத' },
  { v: 365, en: 'Daily', ta: 'நாள்' },
];

export default function CompoundInterestCalculator() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);
  const [freq, setFreq] = useState(12);

  const en = lang === 'en';

  const r = useMemo(() => {
    const fv = calcCI(principal, rate, years, freq);
    const si = principal + (principal * (rate / 100) * years);
    const ear = (Math.pow(1 + (rate / 100) / freq, freq) - 1) * 100;
    return { fv, interest: Math.max(0, fv - principal), si, ear, diff: fv - si };
  }, [principal, rate, years, freq]);

  const growthX = r.fv > 0 ? (r.fv / principal).toFixed(2) : '1.00';
  const intPct = r.fv > 0 ? ((r.interest / r.fv) * 100).toFixed(1) : '0';

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({
        year: y,
        compound: Math.round(calcCI(principal, rate, y, freq)),
        simple: Math.round(principal + (principal * (rate / 100) * y)),
      });
    }
    return data;
  }, [principal, rate, years, freq]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ color: '#64748b', marginBottom: 4 }}>{en ? 'Year' : 'ஆண்டு'} {label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.stroke, fontWeight: 700 }}>{p.name}: ₹{fmt(p.value)}</div>)}
      </div>
    );
  };

  return (
    <div className="calc-root">
      {/* Header */}
      <div className="calc-hero calc-hero--compound">
        <div className="calc-hero-glow" />
        <button className="calc-back-btn" onClick={() => navigate('/tools')}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          {en ? 'Tools' : 'கருவிகள்'}
        </button>
        <div className="calc-hero-content">
          <div className="calc-hero-badge">💹</div>
          <h1 className="calc-hero-title">{en ? 'Compound Interest' : 'கூட்டு வட்டி'}</h1>
          <p className="calc-hero-sub">{en ? 'See the 8th wonder of the world — compound interest at work.' : 'கூட்டு வட்டியின் 8வது அதிசயத்தை காண்க.'}</p>
        </div>
      </div>

      <div className="calc-body">
        {/* Left */}
        <div className="calc-panel calc-panel--inputs">
          <div className="calc-panel-title">{en ? 'Investment Parameters' : 'முதலீட்டு அளவுருக்கள்'}</div>

          <Slider label={en ? 'Principal Amount' : 'அசல் தொகை'}
            value={principal} display={`₹ ${fmt(principal)}`}
            min={10000} max={10000000} step={10000} onChange={setPrincipal}
            minLabel="₹10K" maxLabel="₹1Cr" accent={ACCENT} />
          <Slider label={en ? 'Annual Interest Rate' : 'ஆண்டு வட்டி விகிதம்'}
            value={rate} display={`${rate.toFixed(1)}%`}
            min={1} max={20} step={0.5} onChange={setRate}
            minLabel="1%" maxLabel="20%" accent={ACCENT} />
          <Slider label={en ? 'Time Period' : 'கால அளவு'}
            value={years} display={`${years} ${en ? 'Yrs' : 'ஆண்டுகள்'}`}
            min={1} max={40} step={1} onChange={setYears}
            minLabel={en ? '1 Yr' : '1 ஆண்டு'} maxLabel={en ? '40 Yrs' : '40 ஆண்டுகள்'} accent={ACCENT} />

          {/* Frequency picker */}
          <div className="calc-slider-group">
            <div className="calc-slider-header">
              <span className="calc-slider-label">{en ? 'Compounding Frequency' : 'கூட்டு வட்டி நேர அட்டவணை'}</span>
            </div>
            <div className="calc-freq-grid">
              {FREQ_OPTIONS.map(o => (
                <button key={o.v}
                  className={`calc-freq-btn${freq === o.v ? ' calc-freq-btn--active' : ''}`}
                  onClick={() => setFreq(o.v)}>
                  {en ? o.en : o.ta}
                </button>
              ))}
            </div>
          </div>

          {/* Mini tiles */}
          <div className="calc-mini-tiles">
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">📈</div>
              <div className="calc-mini-tile-label">{en ? 'Growth' : 'வளர்ச்சி'}</div>
              <div className="calc-mini-tile-val">{growthX}×</div>
            </div>
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">🎯</div>
              <div className="calc-mini-tile-label">{en ? 'Eff. Rate' : 'பயனுள்ள விகிதம்'}</div>
              <div className="calc-mini-tile-val">{r.ear.toFixed(2)}%</div>
            </div>
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">⚡</div>
              <div className="calc-mini-tile-label">{en ? 'Compound Gain' : 'கூட்டு ஆதாயம்'}</div>
              <div className="calc-mini-tile-val" style={{ color: ACCENT2 }}>{intPct}%</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="calc-panel calc-panel--results">
          {/* Hero display */}
          <div className="calc-result-hero calc-result-hero--compound">
            <div className="calc-result-hero-label">{en ? 'Future Value' : 'எதிர்கால மதிப்பு'}</div>
            <div className="calc-result-hero-amount">{fmtL(r.fv)}</div>
            <div className="calc-result-hero-sub">{en ? `after ${years} years` : `${years} ஆண்டுகளுக்குப் பிறகு`}</div>
          </div>

          {/* Stats grid */}
          <div className="calc-stats-grid">
            <div className="calc-stat-card" style={{ '--accent': '#667eea' }}>
              <div className="calc-stat-icon">💰</div>
              <div className="calc-stat-body">
                <div className="calc-stat-label">{en ? 'Principal' : 'அசல்'}</div>
                <div className="calc-stat-value" style={{ color: '#667eea' }}>₹ {fmt(principal)}</div>
              </div>
            </div>
            <div className="calc-stat-card" style={{ '--accent': ACCENT }}>
              <div className="calc-stat-icon">📈</div>
              <div className="calc-stat-body">
                <div className="calc-stat-label">{en ? 'Total Interest' : 'மொத்த வட்டி'}</div>
                <div className="calc-stat-value" style={{ color: ACCENT }}>₹ {fmt(r.interest)}</div>
              </div>
            </div>
            <div className="calc-stat-card" style={{ '--accent': ACCENT2 }}>
              <div className="calc-stat-icon">⚡</div>
              <div className="calc-stat-body">
                <div className="calc-stat-label">{en ? 'Compounding Bonus' : 'கூட்டு வட்டி சக்தி'}</div>
                <div className="calc-stat-value" style={{ color: ACCENT2 }}>₹ {fmt(r.diff)}</div>
                <div className="calc-stat-sub">{en ? 'vs Simple Interest' : 'எளிய வட்டியை விட'}</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="calc-chart-section">
            <div className="calc-chart-title">{en ? 'Compound vs Simple Interest' : 'கூட்டு vs எளிய வட்டி'}</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="year" tick={{ fill: GREY, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtL} tick={{ fill: GREY, fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Line type="monotone" dataKey="simple" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="5 5" name={en ? 'Simple Interest' : 'எளிய வட்டி'} />
                <Line type="monotone" dataKey="compound" stroke={ACCENT} strokeWidth={3} dot={false} name={en ? 'Compound Interest' : 'கூட்டு வட்டி'} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Einstein quote */}
          <div className="calc-quote-card">
            <div className="calc-quote-icon">💬</div>
            <blockquote className="calc-quote-text">
              {en
                ? '"Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn\'t, pays it."'
                : '"கூட்டு வட்டி உலகின் எட்டாவது அதிசயம். இதை புரிந்தவர்கள் சம்பாதிக்கிறார்கள்; புரிந்துகொள்ளாதவர்கள் செலுத்துகிறார்கள்."'}
            </blockquote>
            <div className="calc-quote-author">— Albert Einstein</div>
          </div>
        </div>
      </div>
    </div>
  );
}
