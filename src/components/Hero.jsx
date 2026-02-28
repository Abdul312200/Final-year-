import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

// Animated counter hook
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatItem({ value, suffix, label }) {
  const count = useCounter(value);
  return (
    <div className="stat-item">
      <span className="stat-value">{count.toLocaleString()}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function Hero() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const YOUTUBE_URL = 'https://youtu.be/oHAB6f-P-K0?si=dKdvJXiRLgAxrDQd';
  const t = {
    en: {
      badge: ' AI Powered Financial Intelligence',
      title: 'Your Journey to Financial Freedom',
      sub: 'Predict stocks, learn investing, and grow your wealth with cutting-edge AI and real-time market data.',
      cta1: 'Stock Prediction', cta2: 'Watch Demo',
      stats: [
        { value: 60, suffix: '', label: 'Stocks Tracked' },
        { value: 92, suffix: '%', label: 'AI Accuracy' },
      ],
    },
    ta: {
      badge: ' AI இயக்கப்படும் நிதி நுண்ணறிவு',
      title: 'நிதி சுதந்திரத்திற்கான உங்கள் பயணம்',
      sub: 'AI-யின் துணையுடன் பங்குகளை கணிக்கவும், முதலீட்டை கற்கவும், செல்வத்தை வளர்க்கவும்.',
      cta1: 'பங்கு கணிப்பு', cta2: 'டெமோ பார்க்க',
      stats: [
        { value: 60, suffix: '', label: 'கண்காணிக்கப்படும் பங்குகள்' },
        { value: 92, suffix: '%', label: 'AI துல்லியம்' },
      ],
    },
  }[lang];

  return (
    <section className="hero-section" id="home">
      {/* Decorative floating orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      <div className="hero-content">
        <div className="ai-badge">{t.badge}</div>
        <h1 className="hero-title">{t.title}</h1>
        <p className="hero-subtitle">{t.sub}</p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate('/stock-prediction')}>
            <span className="btn-icon">📊</span> {t.cta1}
          </button>
          <button className="btn-secondary" onClick={() => window.open(YOUTUBE_URL, '_blank')}>
            <span className="btn-icon">▶</span> {t.cta2}
          </button>
        </div>

        <div className="hero-stats">
          {t.stats.map((s, i) => (
            <StatItem key={i} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
