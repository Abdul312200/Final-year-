import React, { useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function futureValue({ principal, monthly, annualRatePct, years }) {
  const P = Math.max(0, Number(principal) || 0);
  const PMT = Math.max(0, Number(monthly) || 0);
  const r = Math.max(0, Number(annualRatePct) || 0) / 100;
  const m = Math.max(0, Math.round(Number(years) || 0) * 12);
  const i = r / 12;
  if (m === 0) return P;
  if (i === 0) return P + PMT * m;
  const growth = Math.pow(1 + i, m);
  return P * growth + PMT * ((growth - 1) / i);
}

const ChartTooltip = ({ active, payload, label, lang }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: "0.65rem 1rem", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: "0.82rem" }}>
      <div style={{ color: "#94a3b8", marginBottom: 4, fontSize: "0.72rem" }}>{lang === "en" ? "Year" : "ஆண்டு"} {label}</div>
      <div style={{ color: "#667eea", fontWeight: 800, marginBottom: 2 }}>₹ {formatMoney(payload[1]?.value)}</div>
      <div style={{ color: "#10b981", fontWeight: 600 }}>₹ {formatMoney(payload[0]?.value)} {lang === "en" ? "invested" : "முதலீடு"}</div>
    </div>
  );
};

export default function Investment101() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const navigate = useNavigate();

  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [principal, setPrincipal] = useState(10000);
  const [monthly, setMonthly] = useState(2000);
  const [annualRatePct, setAnnualRatePct] = useState(12);
  const [years, setYears] = useState(10);
  const [risk, setRisk] = useState("moderate");
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const totalLessons = 3;
  const progress = (completedLessons.size / totalLessons) * 100;
  const toggleLesson = (id) => setCompletedLessons(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const fv = useMemo(() => futureValue({ principal, monthly, annualRatePct, years }), [principal, monthly, annualRatePct, years]);
  const totalInvested = useMemo(() => Number(principal) + (Number(monthly) * Number(years) * 12), [principal, monthly, years]);
  const totalReturns = useMemo(() => Math.max(0, fv - totalInvested), [fv, totalInvested]);

  const chartData = useMemo(() => {
    const y = clampNumber(years, 1, 40);
    return Array.from({ length: y + 1 }, (_, year) => ({
      year,
      value: Math.round(futureValue({ principal, monthly, annualRatePct, years: year })),
      invested: Math.round(Number(principal) + Number(monthly) * year * 12),
    }));
  }, [principal, monthly, annualRatePct, years]);

  const riskConfig = useMemo(() => {
    if (risk === "low") return { color: "#10b981", emoji: "🛡️", level: en ? "Conservative" : "பாதுகாப்பான", allocation: { equity: 30, debt: 50, gold: 20 }, tip: en ? "Prioritise emergency fund + diversified debt funds." : "அவசர நிதி + பரவலான கடன் நிதிகளுக்கு முன்னுரிமை." };
    if (risk === "high") return { color: "#ef4444", emoji: "🚀", level: en ? "Aggressive" : "தீவிரமான", allocation: { equity: 80, debt: 15, gold: 5 }, tip: en ? "Long horizon + diversification is key. Never invest rent money." : "நீண்ட காலம் + பரவலாக்கம் முக்கியம். வாடகை பணத்தை முதலீடு செய்யாதீர்கள்." };
    return { color: "#667eea", emoji: "⚖️", level: en ? "Balanced" : "சமநிலை", allocation: { equity: 60, debt: 30, gold: 10 }, tip: en ? "A balanced mix of equity & debt SIPs works well for most people." : "பெரும்பாலானவர்களுக்கு equity மற்றும் debt SIP கலவை நன்றாக செயல்படுகிறது." };
  }, [risk, en]);

  const quizOptions = [
    { id: "a", en: "Moving your money between bank accounts", ta: "வங்கி கணக்குகளுக்கிடையில் பணம் நகர்த்துவது" },
    { id: "b", en: "Earning interest on interest over time", ta: "காலப்போக்கில் வட்டிக்கு வட்டி சம்பாதிப்பது" },
    { id: "c", en: "Paying off debts early", ta: "கடன்களை முன்கூட்டியே அடைப்பது" },
    { id: "d", en: "Getting a government subsidy", ta: "அரசு மானியம் பெறுவது" },
  ];

  return (
    <div className="cl-root">
      {/* ─── Hero ─── */}
      <div className="cl-hero cl-hero--invest">
        <div className="cl-hero-glow" />
        <div className="cl-hero-inner">
          <div className="cl-hero-badge">💹 {en ? "Investment 101" : "முதலீடு 101"}</div>
          <h1 className="cl-hero-title">{en ? "Grow Your Wealth" : "உங்கள் செல்வத்தை வளர்க்கவும்"}</h1>
          <p className="cl-hero-sub">{en ? "Master compound growth, risk profiling, and smart SIP investing." : "கூட்டு வளர்ச்சி, அபாய சுயவிவரம் மற்றும் திட்டமிட்ட SIP முதலீட்டில் தேர்ச்சி பெறுங்கள்."}</p>
          <div className="cl-hero-stats">
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">3</span><span className="cl-hero-stat-label">{en ? "Lessons" : "பாடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">25</span><span className="cl-hero-stat-label">{en ? "Mins" : "நிமிடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">🆓</span><span className="cl-hero-stat-label">{en ? "Free" : "இலவசம்"}</span></div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="cl-progress-bar-wrap">
        <div className="cl-progress-bar-inner">
          <span className="cl-progress-label">{en ? "Your Progress" : "உங்கள் முன்னேற்றம்"}</span>
          <div className="cl-progress-track"><div className="cl-progress-fill cl-progress-fill--invest" style={{ width: `${progress}%` }} /></div>
          <span className="cl-progress-pct">{completedLessons.size}/{totalLessons} {en ? "complete" : "முடிந்தது"}</span>
        </div>
      </div>

      <div className="cl-body">

        {/* ─── Lesson 1: Core Ideas ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--invest">1</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Core Investment Concepts" : "முக்கிய முதலீட்டு கருத்துகள்"}</h2>
              <span className="cl-lesson-time">⏱ 8 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(1) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(1)}>
              {completedLessons.has(1) ? "✅" : "○"} {completedLessons.has(1) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-concept-grid">
              {[
                { icon: "⚖️", title: en ? "Risk vs Return" : "அபாயம் vs வருமானம்", desc: en ? "Higher potential returns come with higher risk. Understand your tolerance before investing." : "அதிக வருமான வாய்ப்பு அதிக அபாயத்துடன் வருகிறது. முதலீடு செய்வதற்கு முன் உங்கள் சகிப்புத்தன்மையை புரிந்து கொள்ளுங்கள்." },
                { icon: "📈", title: en ? "Power of Compounding" : "கூட்டு வட்டி சக்தி", desc: en ? "Earn returns on your returns. ₹10,000 at 12% for 20 years becomes ₹96,000+" : "உங்கள் வருமானத்தில் வருமானம் சம்பாதிக்கவும். 20 ஆண்டுகளில் ₹10,000 ₹96,000+ ஆகும்." },
                { icon: "🎯", title: en ? "Diversification" : "பரவலாக்கம்", desc: en ? "Spread across sectors, asset classes and geographies to reduce risk." : "அபாயத்தை குறைக்க துறைகள், சொத்து வகைகள் மற்றும் நாடுகளில் பரவுங்கள்." },
                { icon: "🔄", title: en ? "SIP Consistency" : "SIP ஒழுங்கு", desc: en ? "Regular monthly SIPs beat lump-sum by averaging out market volatility." : "மாதாந்திர SIP சந்தை ஏற்ற இறக்கத்தை சராசரியாக்கி lump-sum ஐ விட சிறப்பாக செயல்படுகிறது." },
              ].map((c, i) => (
                <div key={i} className="cl-concept-card">
                  <div className="cl-concept-icon">{c.icon}</div>
                  <div className="cl-concept-title">{c.title}</div>
                  <div className="cl-concept-desc">{c.desc}</div>
                </div>
              ))}
            </div>
            <div className="cl-stat-row">
              {[["12%", en ? "Avg Equity Return" : "சராசரி வருமானம்"], ["10+", en ? "Ideal Years" : "சிறந்த ஆண்டுகள்"], ["SIP", en ? "Best Strategy" : "சிறந்த உத்தி"]].map(([n, l], i) => (
                <div key={i} className="cl-stat-badge"><span className="cl-stat-num">{n}</span><span className="cl-stat-label">{l}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Lesson 2: Compound Growth Calculator ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--invest">2</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Compound Growth Calculator" : "கூட்டு வளர்ச்சி கணக்கீடு"}</h2>
              <span className="cl-lesson-time">⏱ 10 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(2) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(2)}>
              {completedLessons.has(2) ? "✅" : "○"} {completedLessons.has(2) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-calc-grid">
              {[
                { emoji: "💰", label: en ? "Starting Amount" : "தொடக்க தொகை", prefix: "₹", val: principal, set: setPrincipal, min: 0, max: null, step: 1000 },
                { emoji: "📆", label: en ? "Monthly SIP" : "மாத SIP", prefix: "₹", val: monthly, set: setMonthly, min: 0, max: null, step: 500 },
                { emoji: "📊", label: en ? "Annual Return" : "ஆண்டு வருமானம்", suffix: "%", val: annualRatePct, set: setAnnualRatePct, min: 0, max: 50, step: 0.5 },
                { emoji: "⏱️", label: en ? "Time Period" : "கால அளவு", suffix: en ? "yrs" : "ஆண்டு", val: years, set: setYears, min: 1, max: 40, step: 1 },
              ].map((f, i) => (
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

            {/* Result hero */}
            <div className="cl-result-hero cl-result-hero--invest">
              <div className="cl-result-hero-label">{en ? "Future Value" : "எதிர்கால மதிப்பு"}</div>
              <div className="cl-result-hero-amount">₹ {formatMoney(fv)}</div>
              <div className="cl-result-hero-sub">{en ? `in ${years} years at ${annualRatePct}% p.a.` : `${annualRatePct}% p.a. இல் ${years} ஆண்டுகளில்`}</div>
            </div>

            <div className="cl-result-breakdown">
              <div className="cl-result-row">
                <span>{en ? "Total Invested" : "மொத்த முதலீடு"}</span>
                <span className="cl-result-blue">₹ {formatMoney(totalInvested)}</span>
              </div>
              <div className="cl-result-row">
                <span>{en ? "Returns Earned" : "வருமானம்"}</span>
                <span className="cl-result-green">₹ {formatMoney(totalReturns)}</span>
              </div>
            </div>

            {/* Chart */}
            <div className="cl-chart-wrap">
              <div className="cl-chart-title">📈 {en ? "Growth Projection" : "வளர்ச்சி முன்னிலை"}</div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="invGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#667eea" stopOpacity={0.35} /><stop offset="95%" stopColor="#667eea" stopOpacity={0} /></linearGradient>
                    <linearGradient id="invGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip content={<ChartTooltip lang={lang} />} />
                  <Area type="monotone" dataKey="invested" stroke="#10b981" strokeWidth={2} fill="url(#invGrad2)" />
                  <Area type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2.5} fill="url(#invGrad1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="cl-tip-box cl-tip-box--invest">
              <span className="cl-tip-icon">💡</span>
              <span>{en ? "Note: Actual returns may vary with market conditions. This is an educational estimate." : "குறிப்பு: சந்தை நிலைமைகளுடன் உண்மையான வருமானம் மாறுபடலாம். இது ஒரு கல்வி மதிப்பீடு."}</span>
            </div>
          </div>
        </section>

        {/* ─── Lesson 3: Risk Profile ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--invest">3</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Your Risk Profile" : "உங்கள் அபாய சுயவிவரம்"}</h2>
              <span className="cl-lesson-time">⏱ 7 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(3) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(3)}>
              {completedLessons.has(3) ? "✅" : "○"} {completedLessons.has(3) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-risk-toggle">
              {[["low", "🛡️", en ? "Conservative" : "பாதுகாப்பான", "#10b981"], ["moderate", "⚖️", en ? "Balanced" : "சமநிலை", "#667eea"], ["high", "🚀", en ? "Aggressive" : "தீவிரமான", "#ef4444"]].map(([v, e2, l, c]) => (
                <button key={v} className={`cl-risk-btn${risk === v ? " cl-risk-btn--active" : ""}`} style={risk === v ? { "--rc": c } : {}} onClick={() => setRisk(v)}>
                  <span>{e2}</span><span>{l}</span>
                </button>
              ))}
            </div>
            <div className="cl-risk-panel" style={{ "--rc": riskConfig.color }}>
              <div className="cl-risk-panel-head"><span>{riskConfig.emoji}</span><strong>{riskConfig.level}</strong></div>
              <p className="cl-risk-panel-tip">{riskConfig.tip}</p>
              <div className="cl-alloc-label">{en ? "Suggested Allocation" : "பரிந்துரைக்கப்பட்ட ஒதுக்கீடு"}</div>
              <div className="cl-alloc-bar">
                <div className="cl-alloc-seg cl-alloc-equity" style={{ width: `${riskConfig.allocation.equity}%` }}><span>{riskConfig.allocation.equity}%</span></div>
                <div className="cl-alloc-seg cl-alloc-debt" style={{ width: `${riskConfig.allocation.debt}%` }}><span>{riskConfig.allocation.debt}%</span></div>
                <div className="cl-alloc-seg cl-alloc-gold" style={{ width: `${riskConfig.allocation.gold}%` }}><span>{riskConfig.allocation.gold}%</span></div>
              </div>
              <div className="cl-alloc-legend">
                {[["cl-alloc-equity", en ? "Equity" : "பங்கு"], ["cl-alloc-debt", en ? "Debt" : "கடன்"], ["cl-alloc-gold", en ? "Gold" : "தங்கம்"]].map(([cls, label], i) => (
                  <span key={i} className="cl-alloc-leg-item"><span className={`cl-alloc-dot ${cls}`} />{label}</span>
                ))}
              </div>
            </div>
            <div className="cl-rules-grid">
              {[
                [1, en ? "Emergency First" : "முதலில் அவசர நிதி", en ? "Build 6 months of expenses before investing." : "முதலீடு செய்வதற்கு முன் 6 மாத செலவு சேமிக்கவும்."],
                [2, en ? "Diversify" : "பரவலாக்கம்", en ? "Never put all eggs in one basket." : "அனைத்தையும் ஒரே இடத்தில் வைக்காதீர்கள்."],
                [3, en ? "Stay Consistent" : "ஒழுங்காக இருங்கள்", en ? "Regular SIPs beat market timing every time." : "தொடர்ச்சியான SIP எப்போதும் சந்தை நேரத்தை விட சிறந்தது."],
              ].map(([n, t, d]) => (
                <div key={n} className="cl-rule-card">
                  <div className="cl-rule-num cl-rule-num--invest">{n}</div>
                  <div><div className="cl-rule-title">{t}</div><div className="cl-rule-desc">{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Quiz ─── */}
        <section className="cl-quiz-card">
          <div className="cl-quiz-header">
            <span className="cl-quiz-badge">🧠 {en ? "Quick Quiz" : "விரைவு வினாடி வினா"}</span>
            <h3 className="cl-quiz-question">{en ? "What is compounding?" : "கூட்டு வட்டி என்றால் என்ன?"}</h3>
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
            ? <button className="cl-quiz-submit" disabled={!quizAnswer} onClick={() => setQuizSubmitted(true)}>{en ? "Submit Answer" : "பதிலை சமர்ப்பிக்கவும்"}</button>
            : <div className={`cl-quiz-result ${quizAnswer === "b" ? "cl-quiz-result--pass" : "cl-quiz-result--fail"}`}>
              {quizAnswer === "b" ? "🎉 " : "❌ "}
              {quizAnswer === "b" ? (en ? "Correct! Compounding means earning interest on your interest." : "சரியானது! கூட்டு வட்டி என்பது வட்டிக்கு வட்டி சம்பாதிப்பதாகும்.")
                : (en ? "Correct answer is (B): Earning interest on interest over time." : "சரியான பதில் (B): காலப்போக்கில் வட்டிக்கு வட்டி சம்பாதிப்பது.")}
            </div>}
        </section>

        {/* ─── CTA ─── */}
        <div className="cl-cta-card cl-cta-card--invest">
          <div className="cl-cta-icon">💼</div>
          <div className="cl-cta-content">
            <div className="cl-cta-label">{en ? "Up Next" : "அடுத்தது"}</div>
            <div className="cl-cta-title">{en ? "Budgeting Basics — Control your spending" : "Budgeting Basics — செலவை கட்டுப்படுத்துங்கள்"}</div>
          </div>
          <button className="cl-cta-btn" onClick={() => navigate("/learn/budgeting")}>{en ? "Start →" : "தொடங்கு →"}</button>
        </div>

      </div>
    </div>
  );
}
