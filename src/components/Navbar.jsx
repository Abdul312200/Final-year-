import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', icon: '🏠', en: 'Home', ta: 'முகப்பு' },
  { to: '/learn', icon: '📚', en: 'Learn', ta: 'கற்று' },
  { to: '/stock-prediction', icon: '📈', en: 'Predict', ta: 'கணிப்பு' },
  { to: '/tools', icon: '🧮', en: 'Tools', ta: 'கருவிகள்' },
];

export default function Navbar({ onChatToggle, chatOpen }) {
  const { lang, toggle: toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="nav-inner">

        {/* ── Brand ── */}
        <Link to="/" className="nav-brand" title="FinTechIQ">
          <div className="nav-logo-wrap">
            <img
              src="/assets/Logoo.png"
              alt="FinTechIQ"
              className="nav-logo-img"
            />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-name">
              Fin<span className="nav-brand-highlight">Tech</span>IQ
            </span>
            <span className="nav-brand-tag">Finance</span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="nav-links-group" aria-label="Main navigation">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <span className="nav-item-icon">{link.icon}</span>
              <span className="nav-item-label">{lang === 'en' ? link.en : link.ta}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div className="nav-actions">
          <button
            className={`nav-chat-btn${chatOpen ? ' nav-chat-btn--active' : ''}`}
            onClick={onChatToggle}
            title={lang === 'en' ? 'Open AI Chat' : 'AI அரட்டை'}
          >
            <span className="nav-chat-icon">🤖</span>
          </button>
          <span className="nav-divider" aria-hidden="true" />
          <button className="nav-lang-btn" onClick={toggleLanguage} title="Switch language">
            <span className="nav-lang-flag">{lang === 'en' ? '' : ''}</span>
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </div>

        {/* ── Hamburger ── */}
        <button
          className={`nav-burger${menuOpen ? ' nav-burger--open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(p => !p)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── Mobile backdrop ── */}
      {menuOpen && (
        <div
          className="nav-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="nav-drawer" role="dialog" aria-modal="true">
          <div className="nav-drawer-inner">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `nav-drawer-item${isActive ? ' nav-drawer-item--active' : ''}`}
              >
                <span>{link.icon}</span>
                <span>{lang === 'en' ? link.en : link.ta}</span>
              </NavLink>
            ))}
            <hr className="nav-drawer-divider" />
            <button className="nav-drawer-item" onClick={() => { onChatToggle(); setMenuOpen(false); }}>
              <span>✦</span><span>{lang === 'en' ? 'AI Chat' : 'AI அரட்டை'}</span>
            </button>
            <button className="nav-drawer-item" onClick={toggleLanguage}>
              <span>{lang === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
