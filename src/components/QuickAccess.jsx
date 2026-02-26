import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

// --- Data ---

const FEATURES = [
  {
    icon: '📚',
    path: '/learn',
    en: {
      title: 'Learn the Basics',
      desc: 'Start with budgeting, saving, and investing fundamentals.',
    },
    ta: {
      title: 'அடிப்படைகளைக் கற்க',
      desc: 'பட்ஜெட், சேமிப்பு மற்றும் முதலீட்டு அடிப்படைகளுடன் தொடங்கவும்.',
    },
  },
  /*{
    icon: '🧮',
    path: '/tools',
    en: {
      title: 'Financial Tools',
      desc: 'Explore our EMI, investment, and tax calculators.',
    },
    ta: {
      title: 'நிதி கருவிகள்',
      desc: 'எங்கள் EMI, முதலீடு மற்றும் வரி கால்குலேட்டர்களைப் பயன்படுத்தவும்.',
    },
  },*/
  {
    icon: '📈',
    path: '/stock-prediction',
    en: {
      title: 'AI Predictions',
      desc: 'Use AI to forecast market trends and stock prices.',
    },
    ta: {
      title: 'AI கணிப்புகள்',
      desc: 'சந்தை போக்குகள் மற்றும் பங்கு விலைகளை கணிக்க AI-ஐப் பயன்படுத்தவும்.',
    },
  },
];

// --- Sub-components ---

/**
 * A single feature card for the Quick Access section.
 * @param {object} props - The component props.
 * @param {string} props.icon - The emoji icon for the card.
 * @param {string} props.title - The title of the feature.
 * @param {string} props.desc - The description of the feature.
 * @param {string} props.path - The path to link to.
 */
const FeatureCard = ({ icon, title, desc, path }) => (
  <Link to={path} className="feature-card-link">
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-desc">{desc}</p>
    </div>
  </Link>
);

// --- Main Component ---

/**
 * The QuickAccess component, displaying key features of the application.
 */
export default function QuickAccess() {
  const { lang } = useLanguage();

  return (
    <section className="quick-access" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            {lang === 'en' ? 'Everything You Need' : 'உங்களுக்கு தேவையான அனைத்தும்'}
          </h2>
          <p className="section-subtitle">
            {lang === 'en' 
              ? 'Powerful tools and resources to guide your financial journey.' 
              : 'உங்கள் நிதிப் பயணத்திற்கு வழிகாட்டும் சக்திவாய்ந்த கருவிகள்.'}
          </p>
        </div>
        <div className="card-grid">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.path}
              path={feature.path}
              icon={feature.icon}
              title={lang === 'en' ? feature.en.title : feature.ta.title}
              desc={lang === 'en' ? feature.en.desc : feature.ta.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
