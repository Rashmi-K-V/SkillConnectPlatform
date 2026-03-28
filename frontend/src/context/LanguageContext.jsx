import { createContext, useState, useEffect } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  // load saved language
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLang(savedLang);
  }, []);

  // save language
  useEffect(() => {
    localStorage.setItem("language", lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default { LanguageProvider, LanguageContext };
