import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'

const tools = [
  {
    icon: '🧮',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glow: 'rgba(102, 126, 234, 0.2)',
    category: 'loan',
    path: '/tools/emi',
    en: {
      title: 'EMI Calculator',
      desc: 'Calculate exact monthly installments for any loan — home, car, or personal.',
      features: ['Amortization Schedule', 'Total Interest View', 'Prepayment Analysis'],
    },
    ta: {
      title: 'EMI கணக்கீட்டாளர்',
      desc: 'வீடு, கார் அல்லது தனிப்பட்ட கடனுக்கான மாதாந்திர தவணைகளை கணக்கிடுங்கள்.',
      features: ['கடன் அட்டவணை', 'மொத்த வட்டி காட்சி', 'முன்கூட்டியே கட்டுதல் பகுப்பாய்வு'],
    },
  },
  {
    icon: '💹',
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    glow: 'rgba(17, 153, 142, 0.2)',
    category: 'investment',
    path: '/tools/compound',
    en: {
      title: 'Compound Interest',
      desc: 'Visualize the power of compounding — watch your money grow over time.',
      features: ['Growth Chart', 'Multiple Periods', 'Inflation Adjusted'],
    },
    ta: {
      title: 'கூட்டு வட்டி கணக்கீடு',
      desc: 'கூட்டு வட்டியின் சக்தியை காட்சிப்படுத்துங்கள் — உங்கள் பணம் எவ்வாறு வளர்கிறது என்று பாருங்கள்.',
      features: ['வளர்ச்சி வரைபடம்', 'பல காலகட்டங்கள்', 'பணவீக்கம் சரிசெய்யப்பட்டது'],
    },
  },
  {
    icon: '💎',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    glow: 'rgba(240, 147, 251, 0.2)',
    category: 'investment',
    path: '/tools/sip',
    en: {
      title: 'SIP Calculator',
      desc: 'Plan your Systematic Investment Plan returns with mutual fund projections.',
      features: ['Monthly SIP Returns', 'Wealth Projection', 'Goal-Based Planning'],
    },
    ta: {
      title: 'SIP கணக்கீட்டாளர்',
      desc: 'மியூச்சுவல் ஃபண்ட் திட்டமிடல் மூலம் SIP வருமானத்தை திட்டமிடுங்கள்.',
      features: ['மாதாந்திர SIP வருமானம்', 'செல்வம் அதிகரிப்பு', 'இலக்கு அடிப்படையிலான திட்டமிடல்'],
    },
  },
]

const categories = [
  { key: 'all', en: 'All Tools', ta: 'அனைத்தும்' },
  { key: 'loan', en: 'Loan', ta: 'கடன்' },
  { key: 'investment', en: 'Investment', ta: 'முதலீடு' },
]

export default function Tools() {
  const { lang } = useLanguage()
  const navigate = useNavigate()
  const [cat, setCat] = useState('all')
  const [active, setActive] = useState(null)

  const visible = cat === 'all' ? tools : tools.filter(t => t.category === cat)
  const tl = t => ({ ...t, ...(lang === 'en' ? t.en : t.ta) })

  return (
    <div className="tp-root">

      {/* ─── Hero ─── */}
      <div className="tp-hero">
        <div className="tp-hero-orb tp-hero-orb-1" />
        <div className="tp-hero-orb tp-hero-orb-2" />
        <div className="tp-hero-inner">
          <div className="tp-hero-badge">
            <span className="tp-hero-badge-dot" />
            {lang === 'en' ? 'Professional-grade calculators' : 'தொழில்முறை கணக்கீட்டாளர்கள்'}
          </div>
          <h1 className="tp-hero-title">
            {lang === 'en'
              ? <><span className="tp-gradient-text">Smart Financial</span> Tools</>
              : <><span className="tp-gradient-text">நுண்மையான நிதி</span> கருவிகள்</>}
          </h1>
          <p className="tp-hero-sub">
            {lang === 'en'
              ? 'Precision calculators that give you instant financial clarity for every decision.'
              : 'ஒவ்வொரு முடிவிற்கும் உடனடி நிதி தெளிவை வழங்கும் துல்லியமான கணக்கீட்டாளர்கள்.'}
          </p>

          {/* quick stats */}
          <div className="tp-hero-stats">
            {[
              { icon: '🔢', val: `${tools.length}`, label: lang === 'en' ? 'Tools' : 'கருவிகள்' },
              { icon: '⚡', val: lang === 'en' ? 'Instant' : 'உடனடி', label: lang === 'en' ? 'Results' : 'முடிவுகள்' },
              { icon: '🔒', val: '100%', label: lang === 'en' ? 'Free' : 'இலவசம்' },
            ].map((s, i) => (
              <div key={i} className="tp-stat">
                <span className="tp-stat-icon">{s.icon}</span>
                <span className="tp-stat-val">{s.val}</span>
                <span className="tp-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Category Filter ─── */}
      <div className="tp-cats-wrap">
        <div className="tp-cats">
          {categories.map(c => (
            <button
              key={c.key}
              className={`tp-cat-btn${cat === c.key ? ' tp-cat-btn--active' : ''}`}
              onClick={() => setCat(c.key)}
            >
              {lang === 'en' ? c.en : c.ta}
            </button>
          ))}
        </div>
        <span className="tp-tool-count">
          {visible.length} {lang === 'en' ? 'tools available' : 'கருவிகள் கிடைக்கின்றன'}
        </span>
      </div>

      {/* ─── Tools Grid ─── */}
      <div className="tp-grid-wrap">
        <div className="tp-grid">
          {visible.map((tool, i) => {
            const m = tl(tool)
            const hot = active === i
            return (
              <div
                key={i}
                className={`tp-card${hot ? ' tp-card--hover' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                style={{ '--tp-glow': tool.glow }}
              >
                {/* gradient background stripe */}
                <div className="tp-card-header" style={{ background: tool.gradient }}>
                  <div className="tp-card-header-icon">{tool.icon}</div>
                  <div className="tp-card-header-overlay" />
                </div>

                <div className="tp-card-body">
                  <h3 className="tp-card-title">{m.title}</h3>
                  <p className="tp-card-desc">{m.desc}</p>

                  {/* features list */}
                  <ul className="tp-features">
                    {m.features.map((f, fi) => (
                      <li key={fi} className="tp-feature-item">
                        <span className="tp-feature-check">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className="tp-card-btn"
                    style={hot ? { background: tool.gradient, borderColor: 'transparent', color: '#fff' } : {}}
                    onClick={() => navigate(tool.path)}
                  >
                    <span>{lang === 'en' ? 'Open Calculator' : 'கணக்கீட்டாளரை திறக்கவும்'}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── Help Banner ─── */}
      <div className="tp-help-banner">
        <div className="tp-help-inner">
          <div>
            <h3 className="tp-help-title">{lang === 'en' ? "Can't find the right tool?" : "சரியான கருவி கிடைக்கவில்லையா?"}</h3>
            <p className="tp-help-sub">{lang === 'en' ? 'Ask our AI assistant for personalized financial calculations.' : 'தனிப்பயனாக்கப்பட்ட நிதி கணக்கீடுகளுக்கு எங்கள் AI உதவியாளரிடம் கேளுங்கள்.'}</p>
          </div>
          <div className="tp-help-icon-wrap">💬</div>
        </div>
      </div>
    </div>
  )
}