import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LanguageProvider from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
);
