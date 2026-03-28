import { useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageContext);

  return (
    <div style={{ marginBottom: "20px" }}>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="kn">Kannada</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
        <option value="ml">Malayalam</option>
        <option value="mr">Marathi</option>
      </select>
    </div>
  );
}
