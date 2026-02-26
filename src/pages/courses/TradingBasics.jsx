import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function TradingBasics() {
    const { lang } = useLanguage();
    const en = lang === "en";
    const navigate = useNavigate();

    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const totalLessons = 3;
    const progress = (completedLessons.size / totalLessons) * 100;

    const toggleLesson = (id) => {
        setCompletedLessons(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const quizOptions = [
        { id: "a", en: "A type of currency", ta: "ஒரு வகை நாணயம்" },
        { id: "b", en: "A share in a company's ownership", ta: "ஒரு நிறுவனத்தின் உரிமையின் பங்கு" },
        { id: "c", en: "A savings account", ta: "ஒரு சேமிப்பு கணக்கு" },
        { id: "d", en: "A government bond", ta: "ஒரு அரசு பத்திரம்" },
    ];
    const correctAnswer = "b";

    const glossary = [
        { term: en ? "Bull Market" : "காளை சந்தை", def: en ? "A period when stock prices are generally rising." : "பங்கு விலைகள் பொதுவாக உயரும் காலம்." },
        { term: en ? "Bear Market" : "கரடி சந்தை", def: en ? "A period when stock prices are generally falling." : "பங்கு விலைகள் பொதுவாக குறையும் காலம்." },
        { term: en ? "Dividend" : "ஈவுத்தொகை", def: en ? "Company profits distributed to shareholders." : "பங்குதாரர்களுக்கு விநியோகிக்கப்படும் லாபம்." },
        { term: en ? "Volume" : "வர்த்தக அளவு", def: en ? "Number of shares traded in a given period." : "கொடுக்கப்பட்ட காலகட்டத்தில் வர்த்தகமான பங்குகளின் எண்ணிக்கை." },
        { term: en ? "Market Cap" : "சந்தை மதிப்பு", def: en ? "Total value of a company's outstanding shares." : "ஒரு நிறுவனத்தின் மொத்த பங்கு மதிப்பு." },
        { term: en ? "IPO" : "IPO", def: en ? "Initial Public Offering — first time a company sells shares publicly." : "நிறுவனம் முதல் முறையாக பொதுமக்களுக்கு பங்குகளை விற்கும் நிகழ்வு." },
    ];

    const orderTypes = [
        { type: "Market Order", icon: "⚡", en: "Buy/sell immediately at current price.", ta: "தற்போதைய விலையில் உடனடியாக வாங்க/விற்க." },
        { type: "Limit Order", icon: "🎯", en: "Buy/sell only at your specified price.", ta: "கஸ்டமர் குறிப்பிட்ட விலையில் மட்டுமே வாங்க/விற்க." },
        { type: "Stop-Loss", icon: "🛡️", en: "Automatically sell when price drops to limit.", ta: "விலை ஒரு வரம்பிற்கு குறையும்போது தானாக விற்றுவிடும்." },
        { type: "Trailing Stop", icon: "📐", en: "Stop-loss that moves up as price rises.", ta: "விலை உயரும்போது stop-loss தானே நகரும்." },
    ];

    return (
        <div className="cl-root">
            {/* ─── Hero ─── */}
            <div className="cl-hero cl-hero--trading">
                <div className="cl-hero-glow" />
                <div className="cl-hero-inner">
                    <div className="cl-hero-badge">📈 {en ? "Stock Market Basics" : "பங்குச் சந்தை அடிப்படை"}</div>
                    <h1 className="cl-hero-title">{en ? "Trading Fundamentals" : "வர்த்தக அடிப்படைகள்"}</h1>
                    <p className="cl-hero-sub">{en ? "Learn how markets work, how stocks are priced, and how to read price action." : "சந்தைகள் எவ்வாறு செயல்படுகின்றன, பங்குகள் எவ்வாறு விலை நிர்ணயிக்கப்படுகின்றன என்பதை அறிக."}</p>
                    <div className="cl-hero-stats">
                        <div className="cl-hero-stat"><span className="cl-hero-stat-num">3</span><span className="cl-hero-stat-label">{en ? "Lessons" : "பாடங்கள்"}</span></div>
                        <div className="cl-hero-stat"><span className="cl-hero-stat-num">20</span><span className="cl-hero-stat-label">{en ? "Mins" : "நிமிடங்கள்"}</span></div>
                        <div className="cl-hero-stat"><span className="cl-hero-stat-num">🆓</span><span className="cl-hero-stat-label">{en ? "Free" : "இலவசம்"}</span></div>
                    </div>
                </div>
            </div>

            {/* ─── Progress Bar ─── */}
            <div className="cl-progress-bar-wrap">
                <div className="cl-progress-bar-inner">
                    <span className="cl-progress-label">{en ? "Your Progress" : "உங்கள் முன்னேற்றம்"}</span>
                    <div className="cl-progress-track">
                        <div className="cl-progress-fill cl-progress-fill--trading" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="cl-progress-pct">{completedLessons.size}/{totalLessons} {en ? "complete" : "முடிந்தது"}</span>
                </div>
            </div>

            <div className="cl-body">

                {/* ─── Lesson 1: What is a Stock? ─── */}
                <section className="cl-lesson-card">
                    <div className="cl-lesson-header">
                        <div className="cl-lesson-num cl-lesson-num--trading">1</div>
                        <div className="cl-lesson-meta">
                            <h2 className="cl-lesson-title">{en ? "What is a Stock?" : "பங்கு என்றால் என்ன?"}</h2>
                            <span className="cl-lesson-time">⏱ 7 {en ? "mins" : "நிமிடங்கள்"}</span>
                        </div>
                        <button className={`cl-complete-btn${completedLessons.has(1) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(1)}>
                            {completedLessons.has(1) ? "✅" : "○"} {completedLessons.has(1) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "முடிந்தது என்று குறிக்க")}
                        </button>
                    </div>
                    <div className="cl-lesson-body">
                        <div className="cl-concept-grid">
                            {[
                                { icon: "🏢", title: en ? "A share of ownership" : "உரிமையின் பங்கு", desc: en ? "Buying a stock means owning a small piece of a public company — its assets and profits." : "பங்கு வாங்குவது என்பது ஒரு பொது நிறுவனத்தின் சொத்துக்கள் மற்றும் லாபத்தின் சிறு பகுதியை உடையவராவது." },
                                { icon: "🐂", title: en ? "Bull Market" : "காளை சந்தை", desc: en ? "Prices rising 20%+ from recent lows — optimism drives buying." : "சமீபத்திய குறைந்த விலையிலிருந்து 20%+ உயர்வு — நம்பிக்கை வாங்குதலை இயக்குகிறது." },
                                { icon: <img src="/assets/bearrr.png.png" alt="Bear Market" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />, title: en ? "Bear Market" : "கரடி சந்தை", desc: en ? "Prices falling 20%+ from recent highs — fear drives selling." : "சமீபத்திய உயர்ந்த விலையிலிருந்து 20%+ வீழ்ச்சி — பயம் விற்பனையை இயக்குகிறது." },
                                { icon: "💰", title: en ? "Dividends" : "ஈவுத்தொகை", desc: en ? "Companies share profits with stockholders — paid quarterly or annually." : "நிறுவனங்கள் பங்குதாரர்களுக்கு லாபத்தை பகிர்கின்றன — காலாண்டு அல்லது ஆண்டு ரீதியில்." },
                            ].map((c, i) => (
                                <div key={i} className="cl-concept-card">
                                    <div className="cl-concept-icon">{c.icon}</div>
                                    <div className="cl-concept-title">{c.title}</div>
                                    <div className="cl-concept-desc">{c.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Candlestick chart visual */}
                        <div className="cl-candle-section">
                            <div className="cl-candle-title">{en ? "📊 Reading a Candlestick" : "📊 கேண்டלிஸ்டிக் படிக்க"}</div>
                            <div className="cl-candle-chart">
                                {[
                                    { h: 80, o: 50, c: 120, l: 20, bull: true },
                                    { h: 130, o: 100, c: 80, l: 60, bull: false },
                                    { h: 100, o: 70, c: 110, l: 40, bull: true },
                                    { h: 120, o: 95, c: 60, l: 30, bull: false },
                                    { h: 90, o: 55, c: 125, l: 25, bull: true },
                                    { h: 140, o: 110, c: 90, l: 65, bull: false },
                                ].map((c, i) => (
                                    <div key={i} className="cl-candle">
                                        <div className={`cl-candle-body ${c.bull ? "cl-candle-bull" : "cl-candle-bear"}`} />
                                        <div className="cl-candle-wick" />
                                    </div>
                                ))}
                            </div>
                            <div className="cl-candle-legend">
                                <span className="cl-candle-legend-item"><span className="cl-candle-bull-dot" />{en ? "Green = Price went up" : "பச்சை = விலை உயர்ந்தது"}</span>
                                <span className="cl-candle-legend-item"><span className="cl-candle-bear-dot" />{en ? "Red = Price went down" : "சிவப்பு = விலை குறைந்தது"}</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Lesson 2: Order Types ─── */}
                <section className="cl-lesson-card">
                    <div className="cl-lesson-header">
                        <div className="cl-lesson-num cl-lesson-num--trading">2</div>
                        <div className="cl-lesson-meta">
                            <h2 className="cl-lesson-title">{en ? "Order Types" : "ஆர்டர் வகைகள்"}</h2>
                            <span className="cl-lesson-time">⏱ 8 {en ? "mins" : "நிமிடங்கள்"}</span>
                        </div>
                        <button className={`cl-complete-btn${completedLessons.has(2) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(2)}>
                            {completedLessons.has(2) ? "✅" : "○"} {completedLessons.has(2) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "முடிந்தது என்று குறிக்க")}
                        </button>
                    </div>
                    <div className="cl-lesson-body">
                        <div className="cl-order-table">
                            {orderTypes.map((o, i) => (
                                <div key={i} className="cl-order-row">
                                    <div className="cl-order-icon">{o.icon}</div>
                                    <div className="cl-order-type">{o.type}</div>
                                    <div className="cl-order-desc">{en ? o.en : o.ta}</div>
                                </div>
                            ))}
                        </div>
                        <div className="cl-tip-box cl-tip-box--trading">
                            <span className="cl-tip-icon">💡</span>
                            <span>{en ? "Beginners should use Limit Orders — they give you control over the price you pay." : "ஆரம்பிகர்கள் Limit Order பயன்படுத்தலாம் — நீங்கள் செலுத்தும் விலையை கட்டுப்படுத்தலாம்."}</span>
                        </div>
                    </div>
                </section>

                {/* ─── Lesson 3: Risk Management ─── */}
                <section className="cl-lesson-card">
                    <div className="cl-lesson-header">
                        <div className="cl-lesson-num cl-lesson-num--trading">3</div>
                        <div className="cl-lesson-meta">
                            <h2 className="cl-lesson-title">{en ? "Risk Management" : "ஆபத்து மேலாண்மை"}</h2>
                            <span className="cl-lesson-time">⏱ 5 {en ? "mins" : "நிமிடங்கள்"}</span>
                        </div>
                        <button className={`cl-complete-btn${completedLessons.has(3) ? " cl-complete-btn--done" : ""}`} onClick={() => toggleLesson(3)}>
                            {completedLessons.has(3) ? "✅" : "○"} {completedLessons.has(3) ? (en ? "Done" : "முடிந்தது") : (en ? "Mark done" : "முடிந்தது என்று குறிக்க")}
                        </button>
                    </div>
                    <div className="cl-lesson-body">
                        <div className="cl-risk-rules">
                            {[
                                { icon: "⚖️", rule: en ? "Never invest money you can't afford to lose." : "இழக்க முடியாத பணத்தை முதலீடு செய்யாதீர்கள்." },
                                { icon: "🎯", rule: en ? "Diversify — spread across sectors, not one stock." : "பரவலாக்கம் — ஒரு பங்கில் அல்ல, பல துறைகளில் பரவுங்கள்." },
                                { icon: "🛡️", rule: en ? "Use stop-loss orders to cap your downside." : "உங்கள் இழப்பை வரம்பிட Stop-Loss பயன்படுத்துங்கள்." },
                                { icon: "📅", rule: en ? "Think long-term — time in market > timing the market." : "நீண்ட காலம் சிந்தியுங்கள் — சந்தையில் நேரம் > சந்தை நேரம் சரியாக தேர்ந்தெடுக்க." },
                            ].map((r, i) => (
                                <div key={i} className="cl-risk-row">
                                    <span className="cl-risk-icon">{r.icon}</span>
                                    <span className="cl-risk-text">{r.rule}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Quiz ─── */}
                <section className="cl-quiz-card">
                    <div className="cl-quiz-header">
                        <span className="cl-quiz-badge">🧠 {en ? "Quick Quiz" : "விரைவு வினாடி வினா"}</span>
                        <h3 className="cl-quiz-question">{en ? "What is a stock?" : "பங்கு என்றால் என்ன?"}</h3>
                    </div>
                    <div className="cl-quiz-options">
                        {quizOptions.map(opt => (
                            <button
                                key={opt.id}
                                className={`cl-quiz-opt${quizAnswer === opt.id ? " cl-quiz-opt--selected" : ""}${quizSubmitted && opt.id === correctAnswer ? " cl-quiz-opt--correct" : ""}${quizSubmitted && quizAnswer === opt.id && opt.id !== correctAnswer ? " cl-quiz-opt--wrong" : ""}`}
                                onClick={() => !quizSubmitted && setQuizAnswer(opt.id)}
                            >
                                <span className="cl-quiz-opt-letter">{opt.id.toUpperCase()}</span>
                                <span>{en ? opt.en : opt.ta}</span>
                            </button>
                        ))}
                    </div>
                    {!quizSubmitted ? (
                        <button className="cl-quiz-submit" disabled={!quizAnswer} onClick={() => setQuizSubmitted(true)}>
                            {en ? "Submit Answer" : "பதிலை சமர்ப்பிக்கவும்"}
                        </button>
                    ) : (
                        <div className={`cl-quiz-result ${quizAnswer === correctAnswer ? "cl-quiz-result--pass" : "cl-quiz-result--fail"}`}>
                            {quizAnswer === correctAnswer ? "🎉 " : "❌ "}
                            {quizAnswer === correctAnswer
                                ? (en ? "Correct! A stock is a share of ownership in a company." : "சரியானது! பங்கு என்பது ஒரு நிறுவனத்தின் உரிமையின் பங்கு.")
                                : (en ? "Not quite — the correct answer is (B): A share in a company's ownership." : "சரியில்லை — சரியான பதில் (B): ஒரு நிறுவனத்தின் உரிமையின் பங்கு.")}
                        </div>
                    )}
                </section>

                {/* ─── Glossary ─── */}
                <section className="cl-glossary-card">
                    <h3 className="cl-glossary-title">📖 {en ? "Key Terms" : "முக்கிய சொற்கள்"}</h3>
                    <div className="cl-glossary-grid">
                        {glossary.map((g, i) => (
                            <div key={i} className="cl-glossary-item">
                                <div className="cl-glossary-term">{g.term}</div>
                                <div className="cl-glossary-def">{g.def}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── Next Course CTA ─── */}
                <div className="cl-cta-card cl-cta-card--trading">
                    <div className="cl-cta-icon">🚀</div>
                    <div className="cl-cta-content">
                        <div className="cl-cta-label">{en ? "Up Next" : "அடுத்தது"}</div>
                        <div className="cl-cta-title">{en ? "Investment 101 — Grow your wealth" : "Investment 101 — செல்வத்தை வளர்க்கவும்"}</div>
                    </div>
                    <button className="cl-cta-btn" onClick={() => navigate("/learn/investment")}>
                        {en ? "Start →" : "தொடங்கு →"}
                    </button>
                </div>

            </div>
        </div>
    );
}
