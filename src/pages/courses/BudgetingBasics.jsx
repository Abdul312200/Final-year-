import React, { useMemo, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function formatMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// Savings progress ring
const ProgressRing = ({ progress, size = 78, strokeWidth = 7 }) => {
  const radius = (size - strokeWidth) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = circ - (progress / 100) * circ;
  const color = progress >= 20 ? "#22c55e" : progress >= 10 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.4s ease" }} />
      </svg>
      <span style={{ fontSize: "1rem", fontWeight: 800, color }}>{progress}%</span>
    </div>
  );
};

export default function BudgetingBasics() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const navigate = useNavigate();

  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [income, setIncome] = useState(50000);
  const [needsPct, setNeedsPct] = useState(50);
  const [wantsPct, setWantsPct] = useState(30);
  const [savingsPct, setSavingsPct] = useState(20);
  const [expenses, setExpenses] = useState({ rent: 15000, groceries: 6000, transport: 3000, bills: 2500, others: 2000 });
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const totalLessons = 3;
  const progress = (completedLessons.size / totalLessons) * 100;
  const toggleLesson = (id) => setCompletedLessons(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const pctTotal = needsPct + wantsPct + savingsPct;
  const allocations = useMemo(() => {
    const s = Math.max(0, Number(income) || 0);
    return { needs: (s * (Number(needsPct) || 0)) / 100, wants: (s * (Number(wantsPct) || 0)) / 100, savings: (s * (Number(savingsPct) || 0)) / 100 };
  }, [income, needsPct, wantsPct, savingsPct]);

  const totalExpenses = useMemo(() => Object.values(expenses).reduce((s, v) => s + (Number(v) || 0), 0), [expenses]);
  const leftover = Math.max(0, (Number(income) || 0) - totalExpenses);
  const savingsProgress = Math.min(100, Math.round((leftover / (Number(income) || 1)) * 100));
  const setExpense = (k, v) => setExpenses(prev => ({ ...prev, [k]: v }));

  const quizOptions = [
    { id: "a", en: "Save 10%, Spend 90%", ta: "10% சேமிப்பு, 90% செலவு" },
    { id: "b", en: "Needs 50%, Wants 30%, Savings 20%", ta: "தேவைகள் 50%, விருப்பங்கள் 30%, சேமிப்பு 20%" },
    { id: "c", en: "Needs 70%, Wants 30%", ta: "தேவைகள் 70%, விருப்பங்கள் 30%" },
    { id: "d", en: "Invest first, spend later", ta: "முதலில் முதலீடு, பிறகு செலவு" },
  ];

  return (
    <div className="cl-root">
      {/* ─── Hero ─── */}
      <div className="cl-hero cl-hero--budget">
        <div className="cl-hero-glow" />
        <div className="cl-hero-inner">
          <div className="cl-hero-badge">💰 {en ? "Budgeting Basics" : "பட்ஜெட் அடிப்படை"}</div>
          <h1 className="cl-hero-title">{en ? "Master Your Money" : "உங்கள் பணத்தை கையாளுங்கள்"}</h1>
          <p className="cl-hero-sub">{en ? "Learn the 50/30/20 rule, track expenses, and build your emergency fund step by step." : "50/30/20 விதி கற்க, செலவுகளை கண்காணிக்க, அவசர நிதி உருவாக்க படிப்படியாக கற்றுக்கொள்ளுங்கள்."}</p>
          <div className="cl-hero-stats">
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">3</span><span className="cl-hero-stat-label">{en ? "Lessons" : "பாடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">20</span><span className="cl-hero-stat-label">{en ? "Mins" : "நிமிடங்கள்"}</span></div>
            <div className="cl-hero-stat"><span className="cl-hero-stat-num">🆓</span><span className="cl-hero-stat-label">{en ? "Free" : "இலவசம்"}</span></div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="cl-progress-bar-wrap">
        <div className="cl-progress-bar-inner">
          <span className="cl-progress-label">{en ? "Your Progress" : "உங்கள் முன்னேற்றம்"}</span>
          <div className="cl-progress-track"><div className="cl-progress-fill cl-progress-fill--budget" style={{ width: `${progress}%` }} /></div>
          <span className="cl-progress-pct">{completedLessons.size}/{totalLessons} {en ? "complete" : "முடிந்தது"}</span>
        </div>
      </div>

      <div className="cl-body">

        {/* ─── Lesson 1: 50/30/20 Rule ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--budget">1</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "The 50/30/20 Rule" : "50/30/20 விதி"}</h2>
              <span className="cl-lesson-time">⏱ 8 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(1) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(1)}>
              {completedLessons.has(1) ? "✅" : "○"} {completedLessons.has(1) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            {/* Visual rule breakdown */}
            <div className="cl-budget-rule-visual">
              {[["🏠", "50%", en ? "Needs" : "தேவைகள்", en ? "Rent, food, utilities, transport" : "வாடகை, உணவு, பயன்பாடுகள்", "#667eea"],
              ["🎉", "30%", en ? "Wants" : "விருப்பங்கள்", en ? "Dining, entertainment, shopping" : "உணவகம், பொழுதுபோக்கு, ஷாப்பிங்", "#f093fb"],
              ["🐷", "20%", en ? "Savings" : "சேமிப்பு", en ? "Emergency fund, SIP, investments" : "அவசர நிதி, SIP, முதலீடுகள்", "#22c55e"]].map(([icon, pct, label, desc, color], i) => (
                <div key={i} className="cl-budget-bucket" style={{ "--bc": color }}>
                  <div className="cl-budget-bucket-pct">{pct}</div>
                  <div className="cl-budget-bucket-icon">{icon}</div>
                  <div className="cl-budget-bucket-label">{label}</div>
                  <div className="cl-budget-bucket-desc">{desc}</div>
                </div>
              ))}
            </div>

            {/* Interactive 50/30/20 */}
            <div className="cl-budget-calc">
              <div className="cl-budget-calc-head">{en ? "Try it with your income" : "உங்கள் வருமானத்துடன் முயற்சிக்கவும்"}</div>
              <div className="cl-input-card" style={{ marginBottom: "1rem" }}>
                <div className="cl-input-head"><span>💰</span><span>{en ? "Monthly Income" : "மாத வருமானம்"}</span></div>
                <div className="cl-input-row">
                  <span className="cl-input-prefix">₹</span>
                  <input className="cl-input" type="number" value={income} min={0} onChange={e => setIncome(e.target.value)} />
                </div>
              </div>
              <div className="cl-budget-pct-row">
                {[["🏠", en ? "Needs" : "தேவைகள்", needsPct, setNeedsPct, "#667eea", allocations.needs],
                ["🎉", en ? "Wants" : "விருப்பங்கள்", wantsPct, setWantsPct, "#f093fb", allocations.wants],
                ["🐷", en ? "Savings" : "சேமிப்பு", savingsPct, setSavingsPct, "#22c55e", allocations.savings]].map(([icon, label, val, set, color, amount], i) => (
                  <div key={i} className="cl-pct-card" style={{ "--pc": color }}>
                    <div className="cl-pct-icon">{icon}</div>
                    <div className="cl-pct-label">{label}</div>
                    <input className="cl-pct-input" type="number" value={val} min={0} max={100} onChange={e => set(Number(e.target.value))} />
                    <div className="cl-pct-sign">%</div>
                    <div className="cl-pct-amount">₹ {formatMoney(amount)}</div>
                  </div>
                ))}
              </div>
              {pctTotal !== 100 && (
                <div className="cl-tip-box cl-tip-box--warn">⚠️ {en ? `Total is ${pctTotal}% — should sum to 100%.` : `தொகை ${pctTotal}% — 100% ஆக இருக்க வேண்டும்.`}</div>
              )}
              {pctTotal === 100 && (
                <div className="cl-tip-box cl-tip-box--success">✅ {en ? "Perfect! Your budget is balanced." : "சரியானது! உங்கள் பட்ஜெட் சமநிலையில் உள்ளது."}</div>
              )}
            </div>
          </div>
        </section>

        {/* ─── Lesson 2: Expense Tracker ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--budget">2</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Mini Expense Tracker" : "சிறு செலவு கண்காணிப்பு"}</h2>
              <span className="cl-lesson-time">⏱ 7 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(2) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(2)}>
              {completedLessons.has(2) ? "✅" : "○"} {completedLessons.has(2) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-expense-list">
              {[{ k: "rent", icon: "🏠", l: en ? "Rent" : "வாடகை" }, { k: "groceries", icon: "🛒", l: en ? "Groceries" : "மளிகை" },
              { k: "transport", icon: "🚗", l: en ? "Transport" : "போக்குவரத்து" }, { k: "bills", icon: "📱", l: en ? "Bills" : "பில்கள்" },
              { k: "others", icon: "📦", l: en ? "Others" : "மற்றவை" }].map(({ k, icon, l }) => (
                <div key={k} className="cl-expense-row">
                  <span className="cl-expense-icon">{icon}</span>
                  <span className="cl-expense-label">{l}</span>
                  <div className="cl-input-row cl-input-row--sm">
                    <span className="cl-input-prefix">₹</span>
                    <input className="cl-input" type="number" value={expenses[k]} min={0} onChange={e => setExpense(k, e.target.value)} />
                  </div>
                  <div className="cl-expense-bar-track">
                    <div className="cl-expense-bar-fill" style={{ width: `${Math.min(100, (Number(expenses[k]) / (Number(income) || 1)) * 100)}%` }} />
                  </div>
                  <span className="cl-expense-pct">{((Number(expenses[k]) / (Number(income) || 1)) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
            <div className="cl-expense-summary">
              <div className="cl-exp-kpi cl-exp-kpi--red">
                <span className="cl-exp-kpi-icon">💸</span>
                <span className="cl-exp-kpi-label">{en ? "Total Expenses" : "மொத்த செலவுகள்"}</span>
                <span className="cl-exp-kpi-val">₹ {formatMoney(totalExpenses)}</span>
              </div>
              <div className="cl-exp-kpi cl-exp-kpi--green">
                <span className="cl-exp-kpi-icon">💚</span>
                <span className="cl-exp-kpi-label">{en ? "Leftover" : "மீதம்"}</span>
                <span className="cl-exp-kpi-val">₹ {formatMoney(leftover)}</span>
              </div>
              <div className="cl-exp-ring">
                <ProgressRing progress={savingsProgress} />
                <span className="cl-exp-ring-label">{en ? "Saved" : "சேமிப்பு"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Lesson 3: Pro Tips ─── */}
        <section className="cl-lesson-card">
          <div className="cl-lesson-header">
            <div className="cl-lesson-num cl-lesson-num--budget">3</div>
            <div className="cl-lesson-meta">
              <h2 className="cl-lesson-title">{en ? "Pro Budgeting Tips" : "நிபுணர் பட்ஜெட் உதவிக்குறிப்புகள்"}</h2>
              <span className="cl-lesson-time">⏱ 5 {en ? "mins" : "நிமிடங்கள்"}</span>
            </div>
            <button className={`cl-complete-btn${completedLessons.has(3) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(3)}>
              {completedLessons.has(3) ? "✅" : "○"} {completedLessons.has(3) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "குறிக்க")}
            </button>
          </div>
          <div className="cl-lesson-body">
            <div className="cl-tips-bento">
              {[["💡", en ? "Pay Yourself First" : "முதலில் சேமிக்கவும்", en ? "Set aside savings before paying any expenses." : "செலவுகளுக்கு முன் சேமிப்பை ஒதுக்குங்கள்."],
              ["📅", en ? "Review Monthly" : "மாதம் மதிப்பாய்வு", en ? "Adjust your budget monthly based on actuals." : "உண்மையான செலவுகளின் படி மாதம் சரிசெய்யுங்கள்."],
              ["🎯", en ? "Set Clear Goals" : "இலக்குகளை அமைக்கவும்", en ? "Goal-oriented saving stays consistent." : "இலக்கு அடிப்படையில் சேமிப்பு தொடர்ந்து இருக்கும்."],
              ["🛡️", en ? "Emergency Fund" : "அவசர நிதி", en ? "3-6 months of expenses in liquid savings." : "3-6 மாத செலவுகளை திரவ சேமிப்பில் வைத்திருங்கள்."],
              ["📊", en ? "Track Everything" : "அனைத்தையும் கண்காணிக்கவும்", en ? "Awareness of every rupee spent changes habits." : "ஒவ்வொரு ரூபாய் பற்றிய விழிப்புணர்வு பழக்கங்களை மாற்றும்."],
              ["⚖️", en ? "Avoid Lifestyle Inflation" : "வாழ்க்கை முறை பணவீக்கம்", en ? "Income grows? Keep expenses stable, invest more." : "வருமானம் வளர்கிறதா? செலவுகளை நிலையாக வைத்திருங்கள்."]].map(([icon, title, desc], i) => (
                <div key={i} className="cl-tip-bento-card">
                  <div className="cl-tip-bento-icon">{icon}</div>
                  <div className="cl-tip-bento-title">{title}</div>
                  <div className="cl-tip-bento-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Quiz ─── */}
        <section className="cl-quiz-card">
          <div className="cl-quiz-header">
            <span className="cl-quiz-badge">🧠 {en ? "Quick Quiz" : "விரைவு வினாடி வினா"}</span>
            <h3 className="cl-quiz-question">{en ? "What does the 50/30/20 rule recommend?" : "50/30/20 விதி என்ன பரிந்துரைக்கிறது?"}</h3>
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
              {quizAnswer === "b" ? (en ? "Correct! Needs 50%, Wants 30%, Savings 20%." : "சரியானது! தேவைகள் 50%, விருப்பங்கள் 30%, சேமிப்பு 20%.") : (en ? "Correct is (B): Needs 50%, Wants 30%, Savings 20%." : "சரியான பதில் (B): தேவைகள் 50%, விருப்பங்கள் 30%, சேமிப்பு 20%.")}
            </div>}
        </section>

        {/* ─── CTA ─── */}
        <div className="cl-cta-card cl-cta-card--budget">
          <div className="cl-cta-icon">🏦</div>
          <div className="cl-cta-content">
            <div className="cl-cta-label">{en ? "Up Next" : "அடுத்தது"}</div>
            <div className="cl-cta-title">{en ? "Banking Essentials — Loans, credit & security" : "Banking Essentials — கடன்கள், கிரெடிட் & பாதுகாப்பு"}</div>
          </div>
          <button className="cl-cta-btn" onClick={() => navigate("/learn/banking")}>{en ? "Start →" : "தொடங்கு →"}</button>
        </div>

      </div>
    </div>
  );
}
