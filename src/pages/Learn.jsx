import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const modules = [
  {
    icon: '📚', slug: 'budgeting-basics', level: 'beginner', xp: 150,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    bgGlow: 'rgba(16, 185, 129, 0.12)',
    en: { title: 'Budgeting Basics', desc: 'Create and manage your monthly budget to achieve financial goals.', tag: 'Beginner', duration: '15 min', lessons: 4 },
    ta: { title: 'பட்ஜெட் அடிப்படைகள்', desc: 'நிதி இலக்குகளை அடைய மாதாந்திர பட்ஜெட்டை உருவாக்கவும்.', tag: 'ஆரம்பம்', duration: '15 நி', lessons: 4 },
  },
  {
    icon: '📈', slug: 'trading-basis', level: 'beginner', xp: 200,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    bgGlow: 'rgba(99, 102, 241, 0.12)',
    en: { title: 'Trading Basis', desc: 'Understand the fundamentals of stock markets, charts, and trading.', tag: 'Beginner', duration: '20 min', lessons: 3 },
    ta: { title: 'வர்த்தக அடிப்படைகள்', desc: 'பங்குச் சந்தை, வரைபடங்கள் மற்றும் வர்த்தகத்தை புரிந்துகொள்ளுங்கள்.', tag: 'ஆரம்பம்', duration: '20 நி', lessons: 3 },
  },
  {
    icon: '💼', slug: 'investment-101', level: 'beginner', xp: 250,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    bgGlow: 'rgba(59, 130, 246, 0.12)',
    en: { title: 'Investment 101', desc: 'Start investing in stocks, bonds, and mutual funds with confidence.', tag: 'Beginner', duration: '30 min', lessons: 4 },
    ta: { title: 'முதலீடு 101', desc: 'நம்பிக்கையுடன் பங்குகள், பத்திரங்கள் மற்றும் மியூச்சுவல் ஃபண்டுகளில் முதலீடு தொடங்குங்கள்.', tag: 'ஆரம்பம்', duration: '30 நி', lessons: 4 },
  },
];

const levelColors = {
  beginner: { bg: 'rgba(16,185,129,0.1)', text: '#059669', dot: '#10b981' },
  intermediate: { bg: 'rgba(245,158,11,0.1)', text: '#b45309', dot: '#f59e0b' },
  advanced: { bg: 'rgba(239,68,68,0.1)', text: '#b91c1c', dot: '#ef4444' },
};

export default function Learn() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [hovered, setHovered] = useState(null);

  const filters = [
    { key: 'all', en: 'All Courses', ta: 'அனைத்தும்' },
    { key: 'beginner', en: 'Beginner', ta: 'ஆரம்பம்' },
  ];

  const displayed = filter === 'all' ? modules : modules.filter(m => m.level === filter);
  const totalXP = modules.reduce((s, m) => s + m.xp, 0);

  const t = m => ({ ...m, ...(lang === 'en' ? m.en : m.ta) });

  return (
    <div className="lp-root">
      {/* ─── Hero Section ─── */}
      <div className="lp-hero">
        <div className="lp-hero-orb lp-hero-orb-1" />
        <div className="lp-hero-orb lp-hero-orb-2" />
        <div className="lp-hero-inner">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            {lang === 'en' ? '3 Expert-crafted courses' : '3 நிபுணர்கள் வடிவமைத்த படிப்புகள்'}
          </div>
          <h1 className="lp-hero-title">
            {lang === 'en' ? <>Your <span className="lp-gradient-text">Learning Path</span> to Financial Freedom</> : <><span className="lp-gradient-text">நிதி சுதந்திரம்</span> கற்றல் பாதை</>}
          </h1>
          <p className="lp-hero-sub">
            {lang === 'en' ? 'From budgeting basics to investing — structured lessons with interactive tools.' : 'பட்ஜெட் அடிப்படைகள் முதல் முதலீடு வரை — ஊடாடும் கருவிகளுடன் கட்டமைக்கப்பட்ட பாடங்கள்.'}
          </p>

          {/* stats row */}
          <div className="lp-hero-stats">
            {[
              { icon: '📘', val: `${modules.length}`, label: lang === 'en' ? 'Courses' : 'படிப்புகள்' },
              { icon: '⚡', val: `${totalXP}`, label: lang === 'en' ? 'Total XP' : 'மொத்த XP' },
              { icon: '🎯', val: '100%', label: lang === 'en' ? 'Free' : 'இலவசம்' },
            ].map((s, i) => (
              <div key={i} className="lp-stat">
                <span className="lp-stat-icon">{s.icon}</span>
                <span className="lp-stat-val">{s.val}</span>
                <span className="lp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div className="lp-filters-wrap">
        <div className="lp-filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`lp-filter-btn${filter === f.key ? ' lp-filter-btn--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {lang === 'en' ? f.en : f.ta}
            </button>
          ))}
        </div>
        <span className="lp-count">
          {displayed.length} {lang === 'en' ? 'courses' : 'படிப்புகள்'}
        </span>
      </div>

      {/* ─── Course Grid ─── */}
      <div className="lp-grid-wrap">
        <div className="lp-grid">
          {displayed.map((mod, i) => {
            const m = t(mod);
            const lc = levelColors[mod.level];
            const hot = hovered === i;
            return (
              <div
                key={i}
                className={`lp-card${hot ? ' lp-card--hover' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ '--card-glow': mod.bgGlow }}
              >
                {/* gradient top stripe */}
                <div className="lp-card-stripe" style={{ background: mod.gradient }} />

                {/* icon orb */}
                <div className="lp-card-icon-wrap" style={{ background: mod.bgGlow }}>
                  <span className="lp-card-icon">{mod.icon}</span>
                </div>

                {/* badges */}
                <div className="lp-card-badges">
                  <span className="lp-level-badge" style={{ background: lc.bg, color: lc.text }}>
                    <span className="lp-level-dot" style={{ background: lc.dot }} />
                    {m.tag}
                  </span>
                  <span className="lp-xp-badge">⚡ {mod.xp} XP</span>
                </div>

                {/* content */}
                <h3 className="lp-card-title">{m.title}</h3>
                <p className="lp-card-desc">{m.desc}</p>

                {/* meta */}
                <div className="lp-card-meta">
                  <span className="lp-meta-item">⏱ {m.duration}</span>
                  <span className="lp-meta-sep">·</span>
                  <span className="lp-meta-item">📖 {m.lessons} {lang === 'en' ? 'lessons' : 'பாடங்கள்'}</span>
                </div>

                {/* progress placeholder */}
                <div className="lp-card-progress">
                  <div className="lp-progress-bg">
                    <div className="lp-progress-fill" style={{ width: '0%', background: mod.gradient }} />
                  </div>
                  <span className="lp-progress-label">{lang === 'en' ? 'Not started' : 'தொடங்கவில்லை'}</span>
                </div>

                {/* CTA */}
                <button
                  className="lp-card-btn"
                  style={{ background: hot ? mod.gradient : '' }}
                  onClick={() => { if (mod.slug) navigate(`/learn/course/${mod.slug}`); }}
                >
                  <span>{lang === 'en' ? 'Start Learning' : 'கற்றல் தொடங்கு'}</span>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Learning Path Banner ─── */}
      <div className="lp-path-banner">
        <div className="lp-path-inner">
          <div className="lp-path-icon">🎓</div>
          <div className="lp-path-text">
            <h3>{lang === 'en' ? 'Recommended Learning Path' : 'பரிந்துரைக்கப்பட்ட கற்றல் பாதை'}</h3>
            <p>{lang === 'en' ? 'Follow this sequence for the best learning experience.' : 'சிறந்த கற்றல் அனுபவத்திற்கு இந்த வரிசையை பின்பற்றவும்.'}</p>
          </div>
          <div className="lp-path-steps">
            {['Budgeting', 'Trading Basis', 'Investment', 'Banking', 'Tax', 'Risk', 'Crypto'].map((s, i) => (
              <React.Fragment key={i}>
                <span className="lp-path-step">{s}</span>
                {i < 6 && <span className="lp-path-arrow">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
