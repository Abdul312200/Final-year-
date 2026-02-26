import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import images from '../assets';

// ── Backend URL ─────────────────────────────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API || 'http://localhost:5000';

// ── Persistent user ID (survives page refresh) ──────────────────────
const USER_ID = (() => {
  let id = localStorage.getItem('fintechiq_uid');
  if (!id) { id = 'ui_' + Math.random().toString(36).slice(2, 9); localStorage.setItem('fintechiq_uid', id); }
  return id;
})();

const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ── Chat logic hook ──────────────────────────────────────────────────
const useChatLogic = (lang) => {
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const sendMessage = useCallback(async (msgText) => {
    const text = (msgText || input).trim();
    if (!text || isTyping) return;

    setMessages(p => [...p, { sender: 'user', text, time: new Date() }]);
    if (!msgText) setInput('');
    setIsTyping(true);

    try {
      const { data } = await axios.post(`${BACKEND_URL}/api/chatbot`, {
        message: text,
        userId:  USER_ID,
        lang,
      });

      // Server responded — use its reply (works even if status 200 carries an error message)
      const reply = data.reply || data.error || 'No response received.';
      setMessages(p => [...p, { sender: 'bot', text: reply, time: new Date() }]);

      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        setSuggestions(data.suggestions);
      }

    } catch (err) {
      let botText;

      if (!navigator.onLine) {
        // True offline
        botText = lang === 'en'
          ? '📡 You appear to be offline. Please check your internet connection.'
          : '📡 இணையத் தொடர்பு இல்லை. மறுபடியும் முயலவும்.';

      } else if (err.response) {
        // Server replied with a non-2xx status — extract message if available
        const serverMsg = err.response?.data?.reply || err.response?.data?.error;
        botText = serverMsg
          || (lang === 'en'
            ? `⚠️ Server error (${err.response.status}). Please try again.`
            : `⚠️ சர்வர் பிழை (${err.response.status}). மீண்டும் முயற்சிக்கவும்.`);

      } else if (err.request) {
        // Request was sent but no response (server down / CORS / network)
        botText = lang === 'en'
          ? `❌ Could not reach the server (${BACKEND_URL}). Make sure the backend is running.`
          : '❌ சர்வர் இணைப்பு தோல்வி. பின்னணி சேவையகம் இயங்குகிறதா என சரிபார்க்கவும்.';

      } else {
        // Unexpected JS error
        botText = lang === 'en'
          ? '❌ An unexpected error occurred. Please try again.'
          : '❌ எதிர்பாரா பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.';
      }

      setMessages(p => [...p, { sender: 'bot', text: botText, time: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, lang]);

  return { messages, input, setInput, isTyping, suggestions, setSuggestions, sendMessage };
};

// ── Component ────────────────────────────────────────────────────────
export default function Chatbot({ open, onToggle }) {
  const { lang, toggle: toggleLang } = useLanguage();
  const {
    messages, input, setInput,
    isTyping, suggestions, setSuggestions,
    sendMessage,
  } = useChatLogic(lang);

  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSuggestions(
      lang === 'en'
        ? ['predict AAPL', 'analyze TSLA', 'compare AAPL vs MSFT', 'RELIANCE price', 'available models']
        : ['AAPL கணிப்பு', 'TSLA பகுப்பாய்வு', 'RELIANCE விலை', 'SIP என்றால் என்ன?']
    );
  }, [lang, setSuggestions]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 300); }, [open]);

  const handleSuggestion = (s) => { setInput(s); setTimeout(() => sendMessage(s), 50); };
  const handleKeyDown    = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const navItems = [
    { to: '/',                 icon: '🏠', en: 'Home',    ta: 'முகப்பு'  },
    { to: '/learn',            icon: '📚', en: 'Learn',   ta: 'கற்று'   },
    { to: '/stock-prediction', icon: '📈', en: 'Predict', ta: 'கணிப்பு' },
  ];

  if (!open) return null;

  return (
    <aside className={`chatbot ${open ? 'open' : ''}`} aria-live="polite">
      <div className="chatbot-window">

        {/* ── Header ── */}
        <header className="chatbot-header">
          <Link to="/" className="chatbot-header-title" onClick={onToggle}>
            <img src={images.logo} alt="FinTechIQ" />
            <div>
              <div>Fin<span className="logo-highlight">Tech</span>IQ{' '}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>AI</span>
              </div>
              <div className="chatbot-header-status">● Online</div>
            </div>
          </Link>
          <button className="chatbot-close" onClick={onToggle} aria-label="Close chat">✕</button>
        </header>

        {/* ── Nav tabs ── */}
        <nav className="chatbot-nav">
          {navItems.map(item => (
            <Link key={item.to} to={item.to} className="chatbot-nav-link" onClick={onToggle}>
              {item.icon} <span>{lang === 'en' ? item.en : item.ta}</span>
            </Link>
          ))}
          <button className="chatbot-nav-link" onClick={toggleLang}>
            🌐 <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>
        </nav>

        {/* ── Messages ── */}
        <div className="chatbot-messages">
          {messages.length === 0 && !isTyping && (
            <div className="chatbot-welcome">
              <div className="chatbot-welcome-icon">🤖</div>
              <h3>{lang === 'en' ? 'FinTechIQ AI Assistant' : 'FinTechIQ AI உதவியாளர்'}</h3>
              <p>
                {lang === 'en'
                  ? 'Ask me to predict stocks, analyze trends, compare companies, or get live prices!'
                  : 'பங்கு கணிப்பு, பகுப்பாய்வு, ஒப்பீடு அல்லது நேரடி விலை கேளுங்கள்!'}
              </p>
              <div className="suggestion-tags">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion-tag" onClick={() => handleSuggestion(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.sender}`}>
              <div className="msg-text">{msg.text}</div>
              <div className="msg-meta">
                {msg.sender === 'bot'
                  ? '🤖 FinTechIQ AI'
                  : lang === 'en' ? '👤 You' : '👤 நீங்கள்'}
                {' · '}{formatTime(msg.time)}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="msg bot">
              <div className="typing-indicator"><span /><span /><span /></div>
              <div className="msg-meta">🤖 FinTechIQ AI · {lang === 'en' ? 'typing…' : 'தட்டச்சு…'}</div>
            </div>
          )}

          {messages.length > 0 && !isTyping && suggestions.length > 0 && (
            <div className="suggestion-tags" style={{ marginTop: 4 }}>
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion-tag" onClick={() => handleSuggestion(s)}>{s}</button>
              ))}
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* ── Input ── */}
        <div className="chatbot-input">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'en'
              ? 'Ask about stocks, predict AAPL, compare TSLA vs NVDA…'
              : 'பங்குகள் பற்றி கேளுங்கள்…'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isTyping || !input.trim()}
            title="Send"
          >
            {isTyping ? '⏳' : '➤'}
          </button>
        </div>

      </div>
    </aside>
  );
}