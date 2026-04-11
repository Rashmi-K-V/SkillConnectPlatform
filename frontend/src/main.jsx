import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LanguageProvider from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext.jsx";
import { WorkerProvider } from "./context/WorkerContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <WorkerProvider>
          <App />
        </WorkerProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
);
