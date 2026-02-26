// Enhanced NLP Service - Connects to backend API for advanced features
// Falls back to client-side processing if backend is unavailable

// Backend API configuration
const _BACKEND = import.meta.env.VITE_API_URL || 'https://final-year-backend-1.onrender.com';
const API_CONFIG = {
  chatbotServer: _BACKEND,
  priceAPI: _BACKEND,
  mlService: _BACKEND,
  timeout: 10000,
};

// Financial keywords for intent detection (fallback)
const FINANCIAL_INTENTS = {
  goldPrice: {
    en: ["gold price", "gold rate", "gold today", "gold value", "cost of gold", "gold per gram"],
    ta: ["தங்க விலை", "தங்கம் விலை", "இன்று தங்கம்", "gold"],
  },
  stockAdvice: {
    en: ["stock", "share", "equity", "buy stock", "best stock", "stock market", "which stock"],
    ta: ["பங்கு", "share", "stock", "சிறந்த பங்கு", "எந்த பங்கு"],
  },
  investment: {
    en: ["invest", "investment", "where to invest", "investment tips", "mutual fund", "how to invest"],
    ta: ["முதலீடு", "invest", "எங்கே முதலீடு", "மியூச்சுவல் ஃபண்ட்", "எப்படி முதலீடு"],
  },
  budgeting: {
    en: ["budget", "budgeting", "save money", "savings", "expense", "manage money"],
    ta: ["பட்ஜெட்", "சேமிப்பு", "செலவு", "budget", "பணம் சேமிக்க"],
  },
  banking: {
    en: ["bank", "account", "loan", "credit card", "emi", "interest rate", "savings account"],
    ta: ["வங்கி", "கணக்கு", "கடன்", "credit", "வட்டி", "emi"],
  },
  marketAnalysis: {
    en: ["market", "analysis", "trend", "nifty", "sensex", "market today", "stock market"],
    ta: ["சந்தை", "பகுப்பாய்வு", "analysis", "nifty", "sensex"],
  },
};

class FinancialNLPService {
  constructor() {
    this.initialized = true;
    this.backendAvailable = false;
    this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
  }

  async initialize() {
    // Check if backend is available
    try {
      const response = await fetch(`${API_CONFIG.chatbotServer}/health`, {
        timeout: 3000,
      });
      this.backendAvailable = response.ok;
      console.log('Backend available:', this.backendAvailable);
    } catch (error) {
      console.log('Backend not available, using client-side fallback');
      this.backendAvailable = false;
    }
    return Promise.resolve();
  }

  detectLanguage(text) {
    const tamilRegex = /[\u0B80-\u0BFF]/;
    return tamilRegex.test(text) ? "ta" : "en";
  }

  detectIntent(text) {
    const lang = this.detectLanguage(text);
    const lowerText = text.toLowerCase();

    let bestMatch = { intent: "general", confidence: 0 };

    for (const [intent, keywords] of Object.entries(FINANCIAL_INTENTS)) {
      const langKeywords = keywords[lang] || [];
      let matchCount = 0;

      for (const keyword of langKeywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        const confidence = Math.min(0.7 + (matchCount * 0.1), 0.95);
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent, confidence };
        }
      }
    }

    return { ...bestMatch, lang };
  }

  async process(text, lang = 'en') {
    // Try backend first if available
    if (this.backendAvailable) {
      try {
        return await this.processWithBackend(text, lang);
      } catch (error) {
        console.log('Backend request failed, falling back to client-side:', error);
      }
    }

    // Fallback to client-side processing
    const detection = this.detectIntent(text);

    return {
      intent: detection.intent,
      confidence: detection.confidence,
      answer: null,
      reply: null,
      language: detection.lang,
      entities: this.extractFinancialEntities(text),
      sentiment: null,
    };
  }

  async processWithBackend(text, lang) {
    const response = await fetch(`${API_CONFIG.chatbotServer}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: text,
        userId: this.userId,
        lang: lang,
      }),
    });

    if (!response.ok) {
      throw new Error('Backend request failed');
    }

    const data = await response.json();

    return {
      intent: data.intent || 'general',
      confidence: data.confidence || 0.8,
      answer: data.reply,
      reply: data.reply,
      suggestion: data.suggestion,
      language: lang,
      entities: [],
      sentiment: null,
      backend: true,
    };
  }

  // Stock prediction features (requires backend ML service)
  async predictStock(ticker, days = 60) {
    try {
      const response = await fetch(`${API_CONFIG.mlService}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, input_days: days }),
      });
      return await response.json();
    } catch (error) {
      console.error('Stock prediction failed:', error);
      return null;
    }
  }

  async analyzeStock(ticker) {
    try {
      const response = await fetch(`${API_CONFIG.mlService}/analyze/${ticker}`);
      return await response.json();
    } catch (error) {
      console.error('Stock analysis failed:', error);
      return null;
    }
  }

  async getStockInfo(ticker) {
    try {
      const response = await fetch(`${API_CONFIG.mlService}/info/${ticker}`);
      return await response.json();
    } catch (error) {
      console.error('Stock info failed:', error);
      return null;
    }
  }

  async trainModel(ticker, mode = 'quick') {
    try {
      const response = await fetch(`${API_CONFIG.chatbotServer}/api/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${mode} train ${ticker} model`,
          userId: this.userId,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Model training failed:', error);
      return null;
    }
  }

  extractFinancialEntities(text) {
    const entities = {
      amounts: [],
      percentages: [],
      dates: [],
    };

    const amountRegex = /(?:₹|Rs\.?|INR|\$)\s*[\d,]+(?:\.\d{1,2})?/gi;
    entities.amounts = text.match(amountRegex) || [];

    const percentRegex = /\d+(?:\.\d+)?%/g;
    entities.percentages = text.match(percentRegex) || [];

    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
    entities.dates = text.match(dateRegex) || [];

    return entities;
  }

  generateContextualResponse(intent, lang, userMessage) {
    const responses = {
      goldPrice: {
        en: "Gold prices change daily based on global markets. For accurate real-time prices, check financial websites like Moneycontrol or GoodReturns. As of today, 22K gold is typically around ₹5,500-6,000 per gram in India.",
        ta: "தங்க விலைகள் உலக சந்தைகளின் அடிப்படையில் தினசரி மாறுகின்றன. துல்லியமான நேரடி விலைகளுக்கு, Moneycontrol அல்லது GoodReturns போன்ற நிதி இணையதளங்களைச் சரிபார்க்கவும். இன்று, 22K தங்கம் இந்தியாவில் பொதுவாக கிராமுக்கு ₹5,500-6,000 ஆகும்.",
      },
      stockAdvice: {
        en: "I cannot recommend specific stocks as I'm not a financial advisor. However, consider: 1) Blue-chip companies for stability 2) Sectoral diversification 3) Your investment horizon 4) Risk tolerance. Always do thorough research or consult a SEBI-registered advisor.",
        ta: "நான் நிதி ஆலோசகர் அல்ல என்பதால் குறிப்பிட்ட பங்குகளை பரிந்துரைக்க முடியாது. இருப்பினும், கருத்தில் கொள்ளுங்கள்: 1) நிலைத்தன்மைக்கு புளூ-சிப் நிறுவனங்கள் 2) துறை வாரியாக பன்முகப்படுத்தல் 3) உங்கள் முதலீட்டு காலம் 4) அபாய சகிப்புத்தன்மை. எப்போதும் முழுமையான ஆய்வு செய்யுங்கள் அல்லது SEBI பதிவு செய்யப்பட்ட ஆலோசகரை அணுகவும்.",
      },
      investment: {
        en: "Investment options in India:\n\n1. **Equity Mutual Funds** - Growth potential, higher risk\n2. **Debt Funds** - Stable returns, lower risk\n3. **PPF/EPF** - Tax-free, long-term\n4. **Fixed Deposits** - Guaranteed returns\n5. **Stocks** - Direct equity (requires research)\n\nStart with your financial goals and risk profile!",
        ta: "இந்தியாவில் முதலீட்டு விருப்பங்கள்:\n\n1. **ஈக்விட்டி மியூச்சுவல் ஃபண்டுகள்** - வளர்ச்சி திறன், அதிக அபாயம்\n2. **கடன் நிதிகள்** - நிலையான வருமானம், குறைந்த அபாயம்\n3. **PPF/EPF** - வரி இல்லாத, நீண்ட கால\n4. **நிலையான வைப்புகள்** - உத்தரவாதமான வருமானம்\n5. **பங்குகள்** - நேரடி ஈக்விட்டி (ஆய்வு தேவை)\n\nஉங்கள் நிதி இலக்குகள் மற்றும் அபாய சுயவிவரத்துடன் தொடங்குங்கள்!",
      },
      budgeting: {
        en: "Smart budgeting tips:\n\n✓ Track ALL expenses for a month\n✓ Follow 50/30/20 rule (Needs/Wants/Savings)\n✓ Build emergency fund (3-6 months expenses)\n✓ Use budgeting apps like Walnut/ET Money\n✓ Review and adjust monthly\n\nStart small, stay consistent!",
        ta: "சிறந்த பட்ஜெட் உதவிக்குறிப்புகள்:\n\n✓ ஒரு மாதத்திற்கு அனைத்து செலவுகளையும் கண்காணிக்கவும்\n✓ 50/30/20 விதியை பின்பற்றவும் (தேவைகள்/விருப்பங்கள்/சேமிப்பு)\n✓ அவசர நிதியை உருவாக்கவும் (3-6 மாத செலவுகள்)\n✓ Walnut/ET Money போன்ற பட்ஜெட் ஆப்களைப் பயன்படுத்தவும்\n✓ மாதாந்திர மதிப்பாய்வு மற்றும் சரிசெய்தல்\n\nசிறியதாக தொடங்குங்கள், தொடர்ச்சியாக இருங்கள்!",
      },
      banking: {
        en: "Banking basics:\n\n**Account types:**\n- Savings: For individuals, earns interest\n- Current: For businesses, no interest\n\n**Loans:**\n- Personal, Home, Car loans available\n- EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]\n\n**Credit Score:** Maintain 750+ for better rates\n\nAlways compare banks for best deals!",
        ta: "வங்கி அடிப்படைகள்:\n\n**கணக்கு வகைகள்:**\n- சேமிப்பு: தனிநபர்களுக்கு, வட்டி கிடைக்கும்\n- நடப்பு: வணிகங்களுக்கு, வட்டி இல்லை\n\n**கடன்கள்:**\n- தனிநபர், வீடு, கார் கடன்கள் கிடைக்கும்\n- EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]\n\n**கிரெடிட் ஸ்கோர்:** சிறந்த விகிதங்களுக்கு 750+ பராமரிக்கவும்\n\nசிறந்த ஒப்பந்தங்களுக்கு எப்போதும் வங்கிகளை ஒப்பிடவும்!",
      },
      marketAnalysis: {
        en: "Market analysis essentials:\n\n📊 **Key Indices:**\n- Nifty 50: Top 50 NSE companies\n- Sensex: Top 30 BSE companies\n\n📈 **What to watch:**\n- Economic indicators (GDP, inflation)\n- Corporate earnings\n- Global markets\n- RBI policy\n\nFocus on long-term trends, not daily noise!",
        ta: "சந்தை பகுப்பாய்வு அடிப்படைகள்:\n\n📊 **முக்கிய குறியீடுகள்:**\n- Nifty 50: முதல் 50 NSE நிறுவனங்கள்\n- Sensex: முதல் 30 BSE நிறுவனங்கள்\n\n📈 **கவனிக்க வேண்டியவை:**\n- பொருளாதார குறிகாட்டிகள் (GDP, பணவீக்கம்)\n- கார்ப்பரேட் வருவாய்\n- உலக சந்தைகள்\n- RBI கொள்கை\n\nதினசரி இரைச்சல் அல்ல, நீண்ட கால போக்குகளில் கவனம் செலுத்துங்கள்!",
      },
      general: {
        en: "I'm here to help with financial literacy! Ask me about:\n\n💰 Budgeting & Savings\n📈 Stock Market & Investments\n🏦 Banking & Loans\n📊 Gold Prices & Market Trends\n💳 Credit Cards & EMI\n\nWhat would you like to learn about?",
        ta: "நிதி கல்வியில் உதவ நான் இங்கே இருக்கிறேன்! என்னிடம் கேளுங்கள்:\n\n💰 பட்ஜெட் & சேமிப்பு\n📈 பங்குச் சந்தை & முதலீடுகள்\n🏦 வங்கி & கடன்கள்\n📊 தங்க விலைகள் & சந்தை போக்குகள்\n💳 கிரெடிட் கார்டுகள் & EMI\n\nஎதைப் பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?",
      },
    };

    const response = responses[intent] || responses.general;
    return response[lang] || response.en;
  }
}

const nlpService = new FinancialNLPService();

export default nlpService;
