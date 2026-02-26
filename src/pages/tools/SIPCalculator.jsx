import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

function fmt(v) {
  const n = Number(v);
  return isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0';
}

function fmtL(v) {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${fmt(v)}`;
}

function calcSIP(monthly, rate, years) {
  const P = Math.max(0, +monthly || 0);
  const r = Math.max(0, +rate || 0) / 100 / 12;
  const n = Math.max(0, +years || 0) * 12;
  if (!n) return 0;
  if (!r) return P * n;
  return P * (Math.pow(1 + r, n) - 1) / r * (1 + r);
}

function Slider({ label, value, display, min, max, step, onChange, minLabel, maxLabel, accent = '#f093fb' }) {
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
          className="calc-range"
          style={{ '--pct': `${pct}%`, '--accent': accent }}
        />
      </div>
      <div className="calc-slider-minmax"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

const ACCENT = '#fa709a';
const ACCENT2 = '#4776e6';

export default function SIPCalculator() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const en = lang === 'en';

  const r = useMemo(() => {
    const fv = calcSIP(monthly, rate, years);
    const invested = monthly * years * 12;
    return { fv, invested, gains: Math.max(0, fv - invested) };
  }, [monthly, rate, years]);

  const gainPct = r.fv > 0 ? ((r.gains / r.fv) * 100).toFixed(1) : 0;
  const invPct = r.fv > 0 ? ((r.invested / r.fv) * 100).toFixed(1) : 100;
  const wealthMultiple = r.invested > 0 ? (r.fv / r.invested).toFixed(2) : '1.00';

  const chartData = useMemo(() => {
    const data = [];
    for (let y = 0; y <= years; y++) {
      data.push({ year: y, invested: Math.round(monthly * y * 12), value: Math.round(calcSIP(monthly, rate, y)) });
    }
    return data;
  }, [monthly, rate, years]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ color: '#64748b', marginBottom: 4 }}>{en ? 'Year' : 'ஆண்டு'} {label}</div>
        <div style={{ color: ACCENT2, fontWeight: 700 }}>Invested: ₹{fmt(payload[0]?.value)}</div>
        <div style={{ color: ACCENT, fontWeight: 700 }}>Value: ₹{fmt(payload[1]?.value)}</div>
      </div>
    );
  };

  return (
    <div className="calc-root">
      {/* Header */}
      <div className="calc-hero calc-hero--sip">
        <div className="calc-hero-glow" />
        <button className="calc-back-btn" onClick={() => navigate('/tools')}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          {en ? 'Tools' : 'கருவிகள்'}
        </button>
        <div className="calc-hero-content">
          <div className="calc-hero-badge">💎</div>
          <h1 className="calc-hero-title">{en ? 'SIP Calculator' : 'SIP கணக்கீட்டாளர்'}</h1>
          <p className="calc-hero-sub">{en ? 'Discover how regular investments grow into substantial wealth through compounding.' : 'முறையான முதலீடு செல்வமாக வளரும் விதத்தை அறியுங்கள்.'}</p>
        </div>
      </div>

      <div className="calc-body">
        {/* Left */}
        <div className="calc-panel calc-panel--inputs">
          <div className="calc-panel-title">{en ? 'Investment Details' : 'முதலீட்டு விவரங்கள்'}</div>

          <Slider label={en ? 'Monthly Investment' : 'மாதாந்திர முதலீடு'}
            value={monthly} display={`₹ ${fmt(monthly)}`}
            min={500} max={100000} step={500} onChange={setMonthly}
            minLabel="₹500" maxLabel="₹1L" accent={ACCENT} />
          <Slider label={en ? 'Expected Return (p.a.)' : 'எதிர்பார்க்கப்படும் வருமானம்'}
            value={rate} display={`${rate.toFixed(1)}%`}
            min={1} max={30} step={0.5} onChange={setRate}
            minLabel="1%" maxLabel="30%" accent={ACCENT} />
          <Slider label={en ? 'Investment Period' : 'முதலீட்டு காலம்'}
            value={years} display={`${years} ${en ? 'Yrs' : 'ஆண்டுகள்'}`}
            min={1} max={40} step={1} onChange={setYears}
            minLabel={en ? '1 Yr' : '1 ஆண்டு'} maxLabel={en ? '40 Yrs' : '40 ஆண்டுகள்'} accent={ACCENT} />

          {/* summary tiles */}
          <div className="calc-mini-tiles">
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">📅</div>
              <div className="calc-mini-tile-label">{en ? 'Total Months' : 'மொத்த மாதங்கள்'}</div>
              <div className="calc-mini-tile-val">{years * 12}</div>
            </div>
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">🚀</div>
              <div className="calc-mini-tile-label">{en ? 'Wealth Multiple' : 'செல்வ பெருக்கம்'}</div>
              <div className="calc-mini-tile-val">{wealthMultiple}×</div>
            </div>
            <div className="calc-mini-tile">
              <div className="calc-mini-tile-icon">⚡</div>
              <div className="calc-mini-tile-label">{en ? 'Gain %' : 'ஆதாயம்'}</div>
              <div className="calc-mini-tile-val">{gainPct}%</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="calc-panel calc-panel--results">
          {/* Big result */}
          <div className="calc-result-hero calc-result-hero--sip">
            <div className="calc-result-hero-label">{en ? 'Future Value' : 'எதிர்கால மதிப்பு'}</div>
            <div className="calc-result-hero-amount">{fmtL(r.fv)}</div>
            <div className="calc-result-hero-sub">{en ? `in ${years} years` : `${years} ஆண்டுகளில்`}</div>
          </div>

          {/* Ratio bar */}
          <div className="calc-ratio-wrap">
            <div className="calc-ratio-bar">
              <div className="calc-ratio-seg calc-ratio-invested" style={{ width: `${invPct}%` }}>
                {+invPct > 15 && <span className="calc-ratio-label">{en ? 'Invested' : 'முதலீடு'}</span>}
              </div>
              <div className="calc-ratio-seg calc-ratio-gains" style={{ width: `${gainPct}%` }}>
                {+gainPct > 12 && <span className="calc-ratio-label">{en ? 'Returns' : 'வருமானம்'}</span>}
              </div>
            </div>
            <div className="calc-ratio-labels">
              <span style={{ color: ACCENT2 }}>₹{fmt(r.invested)} ({invPct}%)</span>
              <span style={{ color: ACCENT }}>+₹{fmt(r.gains)} ({gainPct}%)</span>
            </div>
          </div>

          {/* Chart */}
          <div className="calc-chart-section">
            <div className="calc-chart-title">{en ? 'Wealth Growth Projection' : 'செல்வ வளர்ச்சி கணிப்பு'}</div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT2} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ACCENT2} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtL} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="invested" stroke={ACCENT2} strokeWidth={2} fill="url(#gInv)" dot={false} name={en ? 'Invested' : 'முதலீடு'} />
                <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={3} fill="url(#gVal)" dot={false} name={en ? 'Portfolio Value' : 'மதிப்பு'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="calc-tip">
            <span className="calc-tip-icon">💡</span>
            <span>{en ? 'Starting 5 years earlier can more than double your final corpus due to compounding.' : '5 ஆண்டுகள் முன்னதாக தொடங்குவது கூட்டு வட்டியால் இரண்டு மடங்கு செல்வம் தரும்.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
