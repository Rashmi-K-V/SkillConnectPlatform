// src/context/LanguageContext.jsx
import { createContext, useState, useContext } from "react";
import translations from "../i18n/translation.js";

const LanguageContext = createContext();

export default function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");

  // t("key") returns the translation for current language
  // Falls back to English if key not found in current language
  const t = (key) => {
    const currentLang = translations[lang] || translations["en"];
    const english = translations["en"];
    return currentLang[key] || english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export { LanguageContext };
