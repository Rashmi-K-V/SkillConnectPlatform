import React from "react";
import { useNavigate } from "react-router-dom";

function SelectLanguage() {
  const navigate = useNavigate();

  const selectLanguage = (lang) => {
    localStorage.setItem("language", lang);
    navigate("/login");
  };

  return (
    <div>
      <h2>Select Language</h2>

      <button onClick={() => selectLanguage("en")}>English</button>
      <button onClick={() => selectLanguage("hi")}>Hindi</button>
      <button onClick={() => selectLanguage("kn")}>Kannada</button>
      <button onClick={() => selectLanguage("ta")}>Tamil</button>
      <button onClick={() => selectLanguage("te")}>Telugu</button>
      <button onClick={() => selectLanguage("ml")}>Malayalam</button>
      <button onClick={() => selectLanguage("mr")}>Marathi</button>
    </div>
  );
}

export default SelectLanguage;
