import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function fmt(v) {
  const n = Number(v);
  return isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0';
}

function calcEMI(P, rate, n) {
  P = Math.max(0, +P || 0);
  const r = Math.max(0, +rate || 0) / 100 / 12;
  n = Math.max(0, Math.round(+n || 0));
  if (!n) return 0;
  if (!r) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function Slider({ label, value, display, min, max, step, onChange, minLabel, maxLabel, accent = '#667eea' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="calc-slider-group">
      <div className="calc-slider-header">
        <span className="calc-slider-label">{label}</span>
        <span className="calc-slider-value" style={{ color: accent }}>{display}</span>
      </div>
      <div className="calc-slider-track-wrap">
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          className="calc-range"
          style={{ '--pct': `${pct}%`, '--accent': accent }}
        />
      </div>
      <div className="calc-slider-minmax"><span>{minLabel}</span><span>{maxLabel}</span></div>
    </div>
  );
}

function StatCard({ label, value, sub, accent = '#667eea', icon }) {
  return (
    <div className="calc-stat-card" style={{ '--accent': accent }}>
      <div className="calc-stat-icon">{icon}</div>
      <div className="calc-stat-body">
        <div className="calc-stat-label">{label}</div>
        <div className="calc-stat-value" style={{ color: accent }}>₹ {value}</div>
        {sub && <div className="calc-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function EMICalculator() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [months, setMonths] = useState(240);

  const en = lang === 'en';
  const r = useMemo(() => {
    const emi = calcEMI(loan, rate, months);
    const total = emi * months;
    return { emi, total, interest: Math.max(0, total - loan) };
  }, [loan, rate, months]);

  const interestPct = r.total > 0 ? ((r.interest / r.total) * 100).toFixed(1) : 0;
  const principalPct = r.total > 0 ? ((loan / r.total) * 100).toFixed(1) : 100;

  const table = useMemo(() => {
    const mr = (rate / 100) / 12;
    let bal = loan;
    const rows = [];
    for (let yr = 1; yr <= Math.ceil(months / 12); yr++) {
      let yp = 0, yi = 0;
      for (let m = 0; m < Math.min(12, months - (yr - 1) * 12); m++) {
        const i = bal * mr;
        const p = r.emi - i;
        yp += p; yi += i; bal -= p;
      }
      rows.push({ yr, yp: Math.round(yp), yi: Math.round(yi), bal: Math.max(0, Math.round(bal)) });
    }
    return rows;
  }, [loan, rate, months, r.emi]);

  const pieData = [
    { name: en ? 'Principal' : 'அசல்', value: +loan, color: '#667eea' },
    { name: en ? 'Interest' : 'வட்டி', value: r.interest, color: '#f093fb' },
  ];

  return (
    <div className="calc-root">
      {/* Header */}
      <div className="calc-hero calc-hero--emi">
        <div className="calc-hero-glow" />
        <button className="calc-back-btn" onClick={() => navigate('/tools')}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="18"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          {en ? 'Tools' : 'கருவிகள்'}
        </button>
        <div className="calc-hero-content">
          <div className="calc-hero-badge">🧮</div>
          <h1 className="calc-hero-title">{en ? 'EMI Calculator' : 'EMI கணக்கீட்டாளர்'}</h1>
          <p className="calc-hero-sub">{en ? 'Calculate your exact monthly installments and total interest payable.' : 'உங்கள் மாதாந்திர தவணை மற்றும் மொத்த வட்டியை கணக்கிடுங்கள்.'}</p>
        </div>
      </div>

      <div className="calc-body">
        {/* Left: Controls */}
        <div className="calc-panel calc-panel--inputs">
          <div className="calc-panel-title">{en ? 'Loan Parameters' : 'கடன் விவரங்கள்'}</div>
          <Slider label={en ? 'Loan Amount' : 'கடன் தொகை'} value={loan} display={`₹ ${fmt(loan)}`}
            min={100000} max={10000000} step={50000} onChange={setLoan}
            minLabel="₹1L" maxLabel="₹1Cr" accent="#667eea" />
          <Slider label={en ? 'Interest Rate (p.a.)' : 'வட்டி விகிதம்'} value={rate} display={`${rate.toFixed(2)}%`}
            min={5} max={20} step={0.25} onChange={setRate}
            minLabel="5%" maxLabel="20%" accent="#667eea" />
          <Slider label={en ? 'Loan Tenure' : 'கடன் காலம்'}
            value={months} display={`${Math.floor(months / 12)}y ${months % 12 ? `${months % 12}m` : ''}`}
            min={12} max={360} step={12} onChange={setMonths}
            minLabel={en ? '1 Yr' : '1 ஆண்டு'} maxLabel={en ? '30 Yrs' : '30 ஆண்டுகள்'} accent="#667eea" />

          {/* Pie chart */}
          <div className="calc-donut-wrap">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={v => `₹ ${fmt(v)}`} contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="calc-donut-legend">
              {pieData.map((d, i) => (
                <div key={i} className="calc-donut-legend-item">
                  <span className="calc-donut-dot" style={{ background: d.color }} />
                  <span>{d.name}</span>
                  <span style={{ color: d.color, fontWeight: 700 }}>
                    {i === 0 ? principalPct : interestPct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="calc-panel calc-panel--results">
          {/* Main EMI hero number */}
          <div className="calc-result-hero calc-result-hero--emi">
            <div className="calc-result-hero-label">{en ? 'Monthly EMI' : 'மாதாந்திர EMI'}</div>
            <div className="calc-result-hero-amount">₹ {fmt(r.emi)}</div>
            <div className="calc-result-hero-sub">{en ? `for ${Math.floor(months / 12)} years` : `${Math.floor(months / 12)} ஆண்டுகளுக்கு`}</div>
          </div>

          {/* Stacked bar */}
          <div className="calc-bar-wrap">
            <div className="calc-bar-track">
              <div className="calc-bar-seg" style={{ width: `${principalPct}%`, background: '#667eea' }} title={en ? 'Principal' : 'அசல்'} />
              <div className="calc-bar-seg" style={{ width: `${interestPct}%`, background: '#f093fb' }} title={en ? 'Interest' : 'வட்டி'} />
            </div>
          </div>

          <div className="calc-stats-grid">
            <StatCard label={en ? 'Principal Amount' : 'அசல் தொகை'} value={fmt(loan)} icon="💰" accent="#667eea"
              sub={`${principalPct}% ${en ? 'of total' : 'மொத்தம்'}`} />
            <StatCard label={en ? 'Total Interest' : 'மொத்த வட்டி'} value={fmt(r.interest)} icon="📈" accent="#f093fb"
              sub={`${interestPct}% ${en ? 'of total' : 'மொத்தம்'}`} />
            <StatCard label={en ? 'Total Payment' : 'மொத்த செலுத்துதல்'} value={fmt(r.total)} icon="💎" accent="#4facfe" />
          </div>

          {/* Amortisation table */}
          <div className="calc-table-section">
            <div className="calc-table-title">{en ? 'Yearly Payment Schedule' : 'ஆண்டு செலுத்தும் அட்டவணை'}</div>
            <div className="calc-table-wrap">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>{en ? 'Year' : 'ஆண்டு'}</th>
                    <th>{en ? 'Principal' : 'அசல்'}</th>
                    <th>{en ? 'Interest' : 'வட்டி'}</th>
                    <th>{en ? 'Balance' : 'மீதி'}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map(row => (
                    <tr key={row.yr}>
                      <td><span className="calc-table-yr">{row.yr}</span></td>
                      <td className="calc-td-p">₹ {fmt(row.yp)}</td>
                      <td className="calc-td-i">₹ {fmt(row.yi)}</td>
                      <td className="calc-td-b">₹ {fmt(row.bal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tip */}
          <div className="calc-tip">
            <span className="calc-tip-icon">💡</span>
            <span>{en ? 'Making prepayments can save you significant interest over time.' : 'முன்கூட்டியே செலுத்துவது நீண்ட காலத்தில் வட்டியை கணிசமாக சேமிக்கும்.'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
