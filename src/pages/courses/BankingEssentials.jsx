import React, { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function calcEmi({ principal, annualRatePct, months }) {
  const P = Math.max(0, Number(principal) || 0);
  const r = Math.max(0, Number(annualRatePct) || 0) / 100;
  const n = Math.max(0, Math.round(Number(months) || 0));
  if (n === 0) return 0;
  const i = r / 12;
  if (i === 0) return P / n;
  const pow = Math.pow(1 + i, n);
  return (P * i * pow) / (pow - 1);
}

export default function BankingEssentials() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const navigate = useNavigate();

  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [principal, setPrincipal] = useState(200000);
  const [annualRatePct, setAnnualRatePct] = useState(12);
  const [months, setMonths] = useState(36);
  const [limit, setLimit] = useState(100000);
  const [balance, setBalance] = useState(12000);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({});

  const totalLessons = 3;
  const progress = (completedLessons.size / totalLessons) * 100;
  const toggleLesson = (id) => setCompletedLessons(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const monthlyEmi = useMemo(() => calcEmi({ principal, annualRatePct, months }), [principal, annualRatePct, months]);
  const totalPayable = useMemo(() => monthlyEmi * (Number(months) || 0), [monthlyEmi, months]);
  const totalInterest = useMemo(() => Math.max(0, totalPayable - (Number(principal) || 0)), [totalPayable, principal]);
  const utilization = useMemo(() => { const L = Math.max(0, Number(limit) || 0); const B = Math.max(0, Number(balance) || 0); return L === 0 ? 0 : (B / L) * 100; }, [limit, balance]);
  const utilConfig = useMemo(() => {
    if (utilization <= 30) return { label: en ? "Excellent" : "சிறப்பு", color: "#22c55e", emoji: "🎉", tip: en ? "Great! Keep it below 30%." : "நன்று! 30% க்கும் குறைவாக வைத்திருங்கள்." };
    if (utilization <= 50) return { label: en ? "Good" : "நன்று", color: "#f59e0b", emoji: "👍", tip: en ? "Try to reduce below 30% for best impact." : "சிறந்த விளைவுக்கு 30% கீழ் குறைக்க முயற்சிக்கவும்." };
    return { label: en ? "High" : "அதிகம்", color: "#ef4444", emoji: "⚠️", tip: en ? "High utilization may hurt your credit score." : "அதிக பயன்பாடு கிரெடிட் மதிப்பெண்ணை பாதிக்கலாம்." };
  }, [utilization, en]);

  const toggleCheck = (k) => setSecurityChecks(prev => ({ ...prev, [k]: !prev[k] }));
  const checksTotal = 4;
  const checksDone = Object.values(securityChecks).filter(Boolean).length;

  const quizOptions = [
    { id: "a", en: "Earns high interest & unlimited transactions", ta: "அதிக வட்டி & வரம்பற்ற பரிவர்த்தனைகள்" },
    { id: "b", en: "Earns some interest but has limited transactions", ta: "சிறிது வட்டி ஆனால் வரம்பிட்ட பரிவர்த்தனைகள்" },
    { id: "c", en: "Never earns any interest", ta: "எப்போதும் வட்டி கிடைக்காது" },
    { id: "d", en: "Used only for business purposes", ta: "வணிக நோக்கங்களுக்கு மட்டும்" },
  ];

  return (
    <div className="cl-root">
      {/* ─── Hero ─── */}
      <div className="cl-hero cl-hero--banking">
        <div className="cl-hero-glow" />
        <div className="cl-hero-inner">
          <div className="cl-hero-badge">🏦 {en ? "Banking Essentials" : "வங்கி அடிப்படைகள்"}</div>
          <h1 className="cl-hero-title">{en ? "Banking Made Simple" : "வங்கி எளிமையாக"}</h1>
          <p className="cl-hero-sub">{en ? "Master loans, credit scores, EMI calculations, and digital banking safety." : "கடன்கள், கிரெடிட் மதிப்பெண்கள், EMI கணக்கீடுகள் மற்றும் டிஜிட்டல் பாதுகாப்பு கற்றுக்கொள்ளுங்கள்."}</p>
          <div className="cl-hero-stats">
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">3</span><span className="cl-hero-stat-label">{en ? "Lessons" : "பாடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">22</span><span className="cl-hero-stat-label">{en ? "Mins" : "நிமிடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">🆓</span><span className="cl-hero-stat-label">{en ? "Free" : "இலவசம்"}</span></div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="cl-progress-bar-wrap">
        <div className="cl-progress-bar-inner">
          <span className="cl-progress-label">{en ? "Your Progress" : "உங்கள் முன்னேற்றம்"}</span>
          <div className="cl-progress-track"><div className="cl-progress-fill cl-progress-fill--banking" style={{ width: `${progress}%` }} /></div>
          <span className="cl-progress-pct">{completedLessons.size}/{totalLessons} {en ? "complete" : "முடிந்தது"}</span>
        </div>
      </div>

      <div className="cl-body">

        {/* ─── Lesson 1: Banking basics & account types ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--banking">1</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Accounts & Credit Scores" : "கணக்குகள் & கிரெடிட் மதிப்பெண்"}</h2>
              <span className="cl-lesson-time">⏱ 7 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(1) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(1)}>
              {completedLessons.has(1) ? "✅" : "○"} {completedLessons.has(1) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            {/* Account comparison */}
            <div className="cl-bank-compare">
              <div className="cl-bank-card cl-bank-card--savings">
                <div className="cl-bank-card-icon">🐷</div>
                <div className="cl-bank-card-title">{en ? "Savings Account" : "சேமிப்பு கணக்கு"}</div>
                <ul className="cl-bank-card-list">
                  <li>✅ {en ? "Earns 3-7% interest" : "3-7% வட்டி"}</li>
                  <li>⚠️ {en ? "Limited monthly transactions" : "மாதாந்திர பரிவர்த்தனை வரம்பு"}</li>
                  <li>✅ {en ? "DICGC insured up to ₹5L" : "₹5L வரை DICGC காப்பீடு"}</li>
                  <li>✅ {en ? "For personal use" : "தனிப்பட்ட பயன்பாட்டிற்கு"}</li>
                </ul>
              </div>
              <div className="cl-bank-vs">VS</div>
              <div className="cl-bank-card cl-bank-card--current">
                <div className="cl-bank-card-icon">💼</div>
                <div className="cl-bank-card-title">{en ? "Current Account" : "நடப்பு கணக்கு"}</div>
                <ul className="cl-bank-card-list">
                  <li>❌ {en ? "No interest earned" : "வட்டி இல்லை"}</li>
                  <li>✅ {en ? "Unlimited transactions" : "வரம்பற்ற பரிவர்த்தனைகள்"}</li>
                  <li>✅ {en ? "Overdraft facility" : "ஓவர்ட்ராஃப்ட் வசதி"}</li>
                  <li>✅ {en ? "For business use" : "வணிக பயன்பாட்டிற்கு"}</li>
                </ul>
              </div>
            </div>

            {/* Credit score breakdown */}
            <div className="cl-credit-explainer">
              <div className="cl-credit-title">📊 {en ? "What Affects Your Credit Score?" : "உங்கள் கிரெடிட் மதிப்பெண்ணை என்ன பாதிக்கிறது?"}</div>
              <div className="cl-credit-factors">
                {[["💳", en ? "Payment History" : "கட்டண வரலாறு", "35%", "#667eea"],
                ["📊", en ? "Credit Utilization" : "கிரெடிட் பயன்பாடு", "30%", "#f093fb"],
                ["📅", en ? "Credit Age" : "கிரெடிட் வயது", "15%", "#22c55e"],
                ["🔍", en ? "New Inquiries" : "புதிய விசாரணை", "10%", "#f59e0b"],
                ["💼", en ? "Credit Mix" : "கிரெடிட் கலவை", "10%", "#06b6d4"]].map(([icon, label, pct, color], i) => (
                  <div key={i} className="cl-credit-factor">
                    <span className="cl-credit-factor-icon">{icon}</span>
                    <div className="cl-credit-factor-bar-wrap">
                      <div className="cl-credit-factor-label">{label}</div>
                      <div className="cl-credit-factor-track">
                        <div className="cl-credit-factor-fill" style={{ width: pct, background: color }} />
                      </div>
                    </div>
                    <span className="cl-credit-factor-pct" style={{ color }}>{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Lesson 2: EMI Calculator + Credit Utilization ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--banking">2</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "EMI Calculator & Credit Utilization" : "EMI கணக்கீடு & கிரெடிட் பயன்பாடு"}</h2>
              <span className="cl-lesson-time">⏱ 10 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(2) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(2)}>
              {completedLessons.has(2) ? "✅" : "○"} {completedLessons.has(2) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            {/* EMI calc */}
            <div className="cl-calc-grid">
              {[{ emoji: "💵", label: en ? "Loan Amount" : "கடன் தொகை", prefix: "₹", val: principal, set: setPrincipal, min: 0, step: 10000 },
              { emoji: "📈", label: en ? "Interest Rate" : "வட்டி விகிதம்", suffix: "% p.a.", val: annualRatePct, set: setAnnualRatePct, min: 0, max: 50, step: 0.25 },
              { emoji: "📅", label: en ? "Tenure" : "காலம்", suffix: en ? "months" : "மாதங்கள்", val: months, set: setMonths, min: 1, max: 600, step: 1 }].map((f, i) => (
                <div key={i} className="cl-input-card">
                  <div className="cl-input-head"><span>{f.emoji}</span><span>{f.label}</span></div>
                  <div className="cl-input-row">
                    {f.prefix && <span className="cl-input-prefix">{f.prefix}</span>}
                    <input className="cl-input" type="number" value={f.val} min={f.min} max={f.max} step={f.step} onChange={e => f.set(e.target.value)} />
                    {f.suffix && <span className="cl-input-suffix">{f.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="cl-result-hero cl-result-hero--banking">
              <div className="cl-result-hero-label">{en ? "Monthly EMI" : "மாத EMI"}</div>
              <div className="cl-result-hero-amount">₹ {formatMoney(monthlyEmi)}</div>
            </div>
            <div className="cl-result-breakdown">
              <div className="cl-result-row">
                <span>{en ? "Principal" : "அசல்"}</span>
                <span className="cl-result-blue">₹ {formatMoney(principal)}</span>
              </div>
              <div className="cl-result-row">
                <span>{en ? "Total Interest" : "மொத்த வட்டி"}</span>
                <span style={{ color: "#ef4444", fontWeight: 700 }}>₹ {formatMoney(totalInterest)}</span>
              </div>
              <div className="cl-result-row" style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                <strong>{en ? "Total Payable" : "மொத்த செலுத்த வேண்டியது"}</strong>
                <strong>₹ {formatMoney(totalPayable)}</strong>
              </div>
            </div>
            <div className="cl-emi-bar-section">
              <div className="cl-emi-stacked-bar">
                <div className="cl-emi-principal-bar" style={{ width: `${(Number(principal) / totalPayable) * 100}%` }} />
                <div className="cl-emi-interest-bar" style={{ width: `${(totalInterest / totalPayable) * 100}%` }} />
              </div>
              <div className="cl-emi-bar-legend">
                <span><span className="cl-emi-dot cl-emi-dot--p" />Principal</span>
                <span><span className="cl-emi-dot cl-emi-dot--i" />{en ? "Interest" : "வட்டி"}</span>
              </div>
            </div>
            <div className="cl-tip-box cl-tip-box--banking">💡 {en ? "Tip: Compare loans by total payable cost, not just EMI." : "குறிப்பு: EMI மட்டும் அல்ல, மொத்த செலவு பார்த்து ஒப்பிடுங்கள்."}</div>

            {/* Credit utilization */}
            <div className="cl-util-section">
              <div className="cl-util-title">💳 {en ? "Credit Card Utilization" : "கிரெடிட் கார்டு பயன்பாடு"}</div>
              <div className="cl-calc-grid cl-calc-grid--2">
                {[{ emoji: "💳", label: en ? "Credit Limit" : "கிரெடிட் வரம்பு", prefix: "₹", val: limit, set: setLimit, min: 0 },
                { emoji: "📊", label: en ? "Current Balance" : "தற்போதைய இருப்பு", prefix: "₹", val: balance, set: setBalance, min: 0 }].map((f, i) => (
                  <div key={i} className="cl-input-card">
                    <div className="cl-input-head"><span>{f.emoji}</span><span>{f.label}</span></div>
                    <div className="cl-input-row"><span className="cl-input-prefix">{f.prefix}</span><input className="cl-input" type="number" value={f.val} min={f.min} onChange={e => f.set(e.target.value)} /></div>
                  </div>
                ))}
              </div>
              <div className="cl-util-result" style={{ "--utilColor": utilConfig.color }}>
                <div className="cl-util-gauge-wrap">
                  <div className="cl-util-gauge">
                    <div className="cl-util-gauge-fill" style={{ width: `${Math.min(100, utilization)}%`, background: utilConfig.color }} />
                  </div>
                  <div className="cl-util-pct" style={{ color: utilConfig.color }}>{utilization.toFixed(1)}%</div>
                </div>
                <div className="cl-util-status">
                  <span className="cl-util-emoji">{utilConfig.emoji}</span>
                  <span className="cl-util-label">{utilConfig.label}</span>
                </div>
                <div className="cl-util-tip">{utilConfig.tip}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Lesson 3: Security Checklist ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--banking">3</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Digital Banking Security" : "டிஜிட்டல் பாதுகாப்பு"}</h2>
              <span className="cl-lesson-time">⏱ 5 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(3) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(3)}>
              {completedLessons.has(3) ? "✅" : "○"} {completedLessons.has(3) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-security-progress">
              {checksDone}/{checksTotal} {en ? "security items checked" : "பாதுகாப்பு உருப்படிகள் சரிபார்க்கப்பட்டன"}
              <div className="cl-progress-track" style={{ marginTop: "0.5rem" }}><div className="cl-progress-fill cl-progress-fill--banking" style={{ width: `${(checksDone / checksTotal) * 100}%` }} /></div>
            </div>
            <div className="cl-security-list">
              {[{ k: "2fa", icon: "🔐", title: "2FA", desc: en ? "Enable two-factor authentication on all accounts." : "அனைத்து கணக்குகளிலும் 2FA இயக்கவும்." },
              { k: "pin", icon: "🔢", title: "PIN/OTP", desc: en ? "Never share OTP or PIN with anyone." : "யாருடனும் OTP/PIN பகிர வேண்டாம்." },
              { k: "link", icon: "🔗", title: en ? "Suspicious Links" : "சந்தேக இணைப்புகள்", desc: en ? "Avoid unknown links and phishing apps." : "அறியாத இணைப்புகள் தவிர்க்கவும்." },
              { k: "upd", icon: "📱", title: en ? "App Updates" : "ஆப் புதுப்பிப்புகள்", desc: en ? "Keep banking apps updated for security patches." : "பாதுகாப்பு பேட்ச்களுக்காக ஆப்களை புதுப்பிக்கவும்." }].map(({ k, icon, title, desc }) => (
                <label key={k} className={`cl-security-item${securityChecks[k] ? " cl-security-item--checked" : ""}`} onClick={() => toggleCheck(k)}>
                  <span className="cl-security-item-icon">{icon}</span>
                  <div className="cl-security-item-body">
                    <div className="cl-security-item-title">{title}</div>
                    <div className="cl-security-item-desc">{desc}</div>
                  </div>
                  <div className={`cl-security-checkbox${securityChecks[k] ? " cl-security-checkbox--done" : ""}`}>
                    {securityChecks[k] ? "✅" : "○"}
                  </div>
                </label>
              ))}
            </div>
            {checksDone === checksTotal && (
              <div className="cl-tip-box cl-tip-box--success">🎉 {en ? "Excellent! Your digital banking is fully secured." : "சிறப்பு! உங்கள் டிஜிட்டல் வங்கி முழுமையாக பாதுகாக்கப்பட்டுள்ளது."}</div>
            )}
          </div>
        </section>

        {/* ─── Quiz ─── */}
        <section className="cl-quiz-card">
          <div className="cl-quiz-header">
            <span className="cl-quiz-badge">🧠 {en ? "Quick Quiz" : "விரைவு வினாடி வினா"}</span>
            <h3 className="cl-quiz-question">{en ? "What does a savings account typically offer?" : "சேமிப்பு கணக்கு பொதுவாக என்ன வழங்குகிறது?"}</h3>
          </div>
          <div className="cl-quiz-options">
            {quizOptions.map(opt => (
              <button key={opt.id}
                className={`cl-quiz-opt${quizAnswer === opt.id ? " cl-quiz-opt--selected" : ""}${quizSubmitted && opt.id === "b" ? " cl-quiz-opt--correct" : ""}${quizSubmitted && quizAnswer === opt.id && opt.id !== "b" ? " cl-quiz-opt--wrong" : ""}`}
                onClick={() => !quizSubmitted && setQuizAnswer(opt.id)}>
                <span className="cl-quiz-opt-letter">{opt.id.toUpperCase()}</span>
                <span>{en ? opt.en : opt.ta}</span>
              </button>
            ))}
          </div>
          {!quizSubmitted
            ? <button className="cl-quiz-submit" disabled={!quizAnswer} onClick={() => setQuizSubmitted(true)}>{en ? "Submit Answer" : "சமர்ப்பிக்க"}</button>
            : <div className={`cl-quiz-result ${quizAnswer === "b" ? "cl-quiz-result--pass" : "cl-quiz-result--fail"}`}>
              {quizAnswer === "b" ? "🎉 " : "❌ "}
              {quizAnswer === "b" ? (en ? "Correct! Savings accounts earn interest but have limited transactions." : "சரியானது! சேமிப்பு கணக்கு வட்டி சம்பாதிக்கும் ஆனால் பரிவர்த்தனைகள் வரம்பிட்டவை.") : (en ? "Correct answer is (B)." : "சரியான பதில் (B).")}
            </div>}
        </section>

        {/* ─── CTA — Back to all courses ─── */}
        <div className="cl-cta-card cl-cta-card--banking">
          <div className="cl-cta-icon">🎓</div>
          <div className="cl-cta-content">
            <div className="cl-cta-label">{en ? "All Courses Done!" : "அனைத்து பாடங்களும் முடிந்தன!"}</div>
            <div className="cl-cta-title">{en ? "Explore our AI tools to practice what you've learned" : "கற்றதை பயிற்சி செய்ய AI கருவிகளை ஆராயுங்கள்"}</div>
          </div>
          <button className="cl-cta-btn" onClick={() => navigate("/tools")}>{en ? "Explore Tools →" : "கருவிகளை ஆராயுங்கள் →"}</button>
        </div>

      </div>
    </div>
  );
}
