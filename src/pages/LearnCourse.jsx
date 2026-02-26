import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import BudgetingBasics from "./courses/BudgetingBasics";
import Investment101 from "./courses/Investment101";
import BankingEssentials from "./courses/BankingEssentials";
import TradingBasics from "./courses/TradingBasics";

const COURSE_BY_SLUG = {
  "budgeting-basics": BudgetingBasics,
  "investment-101": Investment101,
  "banking-essentials": BankingEssentials,
  "trading-basis": TradingBasics,
};

const COURSE_STEPS = {
  "budgeting-basics": [
    { id: 1, labelEn: "Introduction", labelTa: "அறிமுகம்" },
    { id: 2, labelEn: "50/30/20 Rule", labelTa: "50/30/20 விதி" },
    { id: 3, labelEn: "Expense Tracker", labelTa: "செலவு கண்காணிப்பு" },
    { id: 4, labelEn: "Quiz", labelTa: "வினாடி வினா" },
  ],
  "investment-101": [
    { id: 1, labelEn: "Getting Started", labelTa: "தொடங்குதல்" },
    { id: 2, labelEn: "Compound Growth", labelTa: "கூட்டு வளர்ச்சி" },
    { id: 3, labelEn: "Risk Profile", labelTa: "இடர் பகுப்பாய்வு" },
    { id: 4, labelEn: "Practice", labelTa: "பயிற்சி" },
  ],
  "banking-essentials": [
    { id: 1, labelEn: "Account Basics", labelTa: "கணக்கு அடிப்படைகள்" },
    { id: 2, labelEn: "EMI Calculator", labelTa: "EMI கணக்கீடு" },
    { id: 3, labelEn: "Credit Health", labelTa: "கடன் ஆரோக்கியம்" },
    { id: 4, labelEn: "Safety Tips", labelTa: "பாதுகாப்பு குறிப்புகள்" },
  ],
  "trading-basis": [
    { id: 1, labelEn: "Introduction", labelTa: "அறிமுகம்" },
    { id: 2, labelEn: "Market Trends", labelTa: "சந்தை போக்குகள்" },
    { id: 3, labelEn: "Risk Management", labelTa: "ஆபத்து மேலாண்மை" },
  ]
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function LoadingSpinner({ lang }) {
  return (
    <div className="course-loader">
      <div className="course-loader-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p className="course-loader-text">
        {lang === "en" ? "Loading your course..." : "படிப்பு ஏற்றப்படுகிறது..."}
      </p>
    </div>
  );
}

function ProgressStepper({ steps, currentStep, lang }) {
  return (
    <div className="course-stepper">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`course-step ${index < currentStep ? "completed" : ""} ${index === currentStep ? "active" : ""
            }`}
        >
          <div className="course-step-indicator">
            {index < currentStep ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <span>{step.id}</span>
            )}
          </div>
          <span className="course-step-label">
            {lang === "en" ? step.labelEn : step.labelTa}
          </span>
          {index < steps.length - 1 && <div className="course-step-line" />}
        </div>
      ))}
    </div>
  );
}

function FloatingNav({ lang }) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="course-floating-nav">
      <button
        className="course-floating-btn"
        onClick={scrollToTop}
        title={lang === "en" ? "Back to top" : "மேலே செல்"}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
        </svg>
      </button>
    </div>
  );
}

export default function LearnCourse() {
  const { lang } = useLanguage();
  const { slug, moduleId } = useParams();
  const location = useLocation();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const moduleFromState = location.state?.module;
  const started = location.state?.started;

  useEffect(() => {
    if (moduleFromState) return;
    setLoading(true);

    fetch(`https://final-year-backend-2.onrender.com/api/learn/modules?lang=${lang}`)
      .then((res) => res.json())
      .then((data) => setModules(Array.isArray(data?.modules) ? data.modules : []))
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [lang, moduleFromState]);

  const resolvedModule = useMemo(() => {
    if (moduleFromState) return moduleFromState;
    if (!modules?.length) return null;

    if (moduleId) {
      const numericId = Number(moduleId);
      return modules.find((m) => Number(m.id) === numericId) || null;
    }

    if (slug) {
      const bySlug = modules.find((m) => slugify(m.slug) === slug) || null;
      if (bySlug) return bySlug;
      return modules.find((m) => slugify(m.title) === slug) || null;
    }

    return null;
  }, [moduleFromState, modules, moduleId, slug]);

  const resolvedSlug = useMemo(() => {
    if (slug) return slug;
    if (resolvedModule?.slug) return slugify(resolvedModule.slug);
    if (resolvedModule?.title) return slugify(resolvedModule.title);
    return "";
  }, [slug, resolvedModule]);

  const CourseComponent = COURSE_BY_SLUG[resolvedSlug];
  const steps = COURSE_STEPS[resolvedSlug] || [];

  const getDifficultyColor = (level) => {
    const l = (level || "").toLowerCase();
    if (l.includes("beginner") || l.includes("தொடக்க")) return "beginner";
    if (l.includes("intermediate") || l.includes("இடைநிலை")) return "intermediate";
    if (l.includes("advanced") || l.includes("மேம்பட்ட")) return "advanced";
    return "beginner";
  };

  return (
    <div className="course-page">
      {/* Decorative background elements */}
      <div className="course-bg-decor">
        <div className="course-bg-circle course-bg-circle-1" />
        <div className="course-bg-circle course-bg-circle-2" />
        <div className="course-bg-circle course-bg-circle-3" />
      </div>

      <div className="course-header">
        <div className="course-header-inner">
          <div className="course-breadcrumbs">
            <Link to="/learn" className="course-back">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              {lang === "en" ? "Back to Learn" : "கற்றல் பக்கத்திற்கு"}
            </Link>

            {resolvedModule && (
              <div className="course-breadcrumb-trail">
                <span className="course-breadcrumb-sep">›</span>
                <span className="course-breadcrumb-current">
                  {resolvedModule.title}
                </span>
              </div>
            )}
          </div>

          <div className="course-hero">
            <div className="course-hero-icon-wrap">
              <div className="course-hero-icon">{resolvedModule?.icon || "📚"}</div>
              <div className="course-hero-icon-glow" />
            </div>

            <div className="course-hero-text">
              <div className="course-title-row">
                <h1 className="course-title">
                  {resolvedModule?.title ||
                    (lang === "en" ? "Learning Module" : "கற்றல் தொகுதி")}
                </h1>
                {started === true && (
                  <span className="course-badge course-badge-success">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    {lang === "en" ? "In Progress" : "தொடர்கிறது"}
                  </span>
                )}
              </div>

              <p className="course-subtitle">
                {resolvedModule?.desc ||
                  (lang === "en"
                    ? "Follow the lessons and use the mini tools to practice."
                    : "பாடங்களை பின்பற்றி சிறு கருவிகளைப் பயன்படுத்தி பயிற்சி செய்யுங்கள்.")}
              </p>

              <div className="course-meta">
                {resolvedModule?.duration && (
                  <div className="course-meta-item">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span>{resolvedModule.duration}</span>
                  </div>
                )}
                {resolvedModule?.level && (
                  <div className={`course-meta-item course-level-${getDifficultyColor(resolvedModule.level)}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span>{resolvedModule.level}</span>
                  </div>
                )}
                {started === false && (
                  <div className="course-meta-item course-meta-offline">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7zm-6.6 8.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7L12 21.5l3.07-4.04 3.91 3.91 1.27-1.27-3.21-3.88z" />
                    </svg>
                    <span>{lang === "en" ? "Offline Mode" : "ஆஃப்லைன்"}</span>
                  </div>
                )}
              </div>

              {/* Progress Stepper */}
              {steps.length > 0 && (
                <ProgressStepper steps={steps} currentStep={currentStep} lang={lang} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="course-container">
        {loading ? (
          <LoadingSpinner lang={lang} />
        ) : CourseComponent ? (
          <>
            <CourseComponent module={resolvedModule} onStepChange={setCurrentStep} />
            <FloatingNav lang={lang} />
          </>
        ) : (
          <div className="course-card course-card-empty">
            <div className="course-empty-icon">🚧</div>
            <h2 className="course-section-title">
              {lang === "en" ? "Content Coming Soon" : "உள்ளடக்கம் விரைவில்"}
            </h2>
            <p className="course-text">
              {lang === "en"
                ? "We're working hard to bring you this course. Check back soon!"
                : "இந்த படிப்பை விரைவில் கொண்டு வருகிறோம். மீண்டும் வாருங்கள்!"}
            </p>
            <Link to="/learn" className="course-btn" style={{ marginTop: "1.5rem" }}>
              {lang === "en" ? "Browse Other Courses" : "மற்ற படிப்புகளைப் பார்க்க"}
            </Link>
          </div>
        )}
      </div>

      {/* Course Footer */}
      <div className="course-footer">
        <div className="course-footer-inner">
          <div className="course-footer-help">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
            <span>{lang === "en" ? "Need help? Chat with our AI assistant" : "உதவி தேவையா? AI உடன் பேசுங்கள்"}</span>
          </div>
          <div className="course-footer-progress">
            <span>{lang === "en" ? "Your progress is automatically saved" : "உங்கள் முன்னேற்றம் தானாக சேமிக்கப்படும்"}</span>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
