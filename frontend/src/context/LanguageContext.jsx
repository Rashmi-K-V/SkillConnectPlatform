// src/context/LanguageContext.jsx
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import translations from "../i18n/translation.js";
import axios from "axios";

const LanguageContext = createContext();

// Cache translations to avoid repeated API calls
const translationCache = {};

export default function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem("sc_lang") || "en",
  );
  // pageTranslations: { originalText -> translatedText }
  const [pageTranslations, setPageTranslations] = useState({});
  const [translating, setTranslating] = useState(false);

  const setLang = useCallback(async (newLang) => {
    localStorage.setItem("sc_lang", newLang);
    setLangState(newLang);
    if (newLang !== "en") {
      await translatePageContent(newLang);
    } else {
      setPageTranslations({});
    }
  }, []);

  // Translates arbitrary text via your backend proxy
  const translateText = useCallback(async (text, targetLang) => {
    if (!text || targetLang === "en") return text;
    const cacheKey = `${targetLang}::${text}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];
    try {
      const res = await axios.post("/api/auth/translate", {
        text,
        targetLang,
      });
      const translated = res.data.translated || text;
      translationCache[cacheKey] = translated;
      return translated;
    } catch {
      return text;
    }
  }, []);

  // ✅ Fix 9: translate all static UI strings to selected language
  const translatePageContent = useCallback(async (targetLang) => {
    setTranslating(true);
    try {
      const en = translations["en"];
      const keys = Object.keys(en);
      const texts = keys.map((k) => en[k]);
      // Batch translate all UI strings at once
      const res = await axios.post("/api/auth/translate-batch", {
        texts,
        targetLang,
      });
      const translated = res.data.translations || texts;
      const map = {};
      keys.forEach((k, i) => {
        map[k] = translated[i];
      });
      setPageTranslations(map);
    } catch (err) {
      console.error("Page translation failed:", err);
    } finally {
      setTranslating(false);
    }
  }, []);

  // t() uses translated page strings if available, else falls back to i18n file
  const t = useCallback(
    (key) => {
      if (lang !== "en" && pageTranslations[key]) return pageTranslations[key];
      const currentLang = translations[lang] || translations["en"];
      const english = translations["en"];
      return currentLang[key] || english[key] || key;
    },
    [lang, pageTranslations],
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, t, translateText, translating }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
