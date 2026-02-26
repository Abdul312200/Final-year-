import { useState, useCallback, useEffect } from "react";
import nlpService from "../services/nlpService";

const TYPING_DELAY = 800;

export function useEnhancedChat(lang) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [nlpReady, setNlpReady] = useState(false);
  const [backendStatus, setBackendStatus] = useState({ available: false, checked: false });

  // Initialize NLP service
  useEffect(() => {
    nlpService.initialize().then(() => {
      setNlpReady(true);
      setBackendStatus({
        available: nlpService.backendAvailable,
        checked: true
      });
    });
  }, []);

  const sendMessage = useCallback(
    async (messageText) => {
      const text = (messageText || input).trim();
      if (!text || isTyping) return;

      // Add user message
      const userMsg = { sender: "user", text, time: new Date() };
      setMessages((prev) => [...prev, userMsg]);

      if (!messageText) setInput("");
      setIsTyping(true);

      try {
        // Process with NLP (backend or client-side)
        const nlpResult = await nlpService.process(text, lang);
        
        console.log("NLP Analysis:", {
          intent: nlpResult.intent,
          confidence: nlpResult.confidence,
          language: nlpResult.language,
          backend: nlpResult.backend || false,
        });

        await new Promise((r) => setTimeout(r, TYPING_DELAY));

        let reply = "";
        let suggestion = null;

        // Check if backend provided a response
        if (nlpResult.backend && nlpResult.reply) {
          reply = nlpResult.reply;
          suggestion = nlpResult.suggestion;
        } 
        // Use NLP-generated answer if available and confident
        else if (nlpResult.answer && nlpResult.confidence > 0.6) {
          reply = nlpResult.answer;
        } 
        // Fallback: Generate contextual response based on detected intent
        else {
          reply = nlpService.generateContextualResponse(
            nlpResult.intent,
            nlpResult.language || lang,
            text
          );
        }

        // Add disclaimer for investment/stock advice (only if not from backend)
        if (
          !nlpResult.backend &&
          (nlpResult.intent === "stockAdvice" || nlpResult.intent === "investment")
        ) {
          const disclaimer =
            lang === "ta"
              ? "\n\n⚠️ மறுப்பு: இது கல்வி நோக்கங்களுக்கு மட்டுமே. முதலீட்டு முடிவுகளுக்கு முன் தகுதிவாய்ந்த நிதி ஆலோசகரை அணுகவும்."
              : "\n\n⚠️ Disclaimer: This is for educational purposes only. Consult a qualified financial advisor before making investment decisions.";
          reply += disclaimer;
        }

        const botMessage = {
          sender: "bot",
          text: reply,
          time: new Date(),
          intent: nlpResult.intent,
          confidence: nlpResult.confidence,
          backend: nlpResult.backend || false,
        };

        if (suggestion) {
          botMessage.suggestion = suggestion;
        }

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        console.error("Enhanced chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text:
              lang === "ta"
                ? "மன்னிக்கவும், தொழில்நுட்ப பிரச்சனை ஏற்பட்டுள்ளது. மீண்டும் முயற்சிக்கவும்."
                : "Sorry, a technical error occurred. Please try again.",
            time: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, lang]
  );

  return {
    messages,
    input,
    setInput,
    isTyping,
    sendMessage,
    nlpReady,
    backendStatus,
  };
}
