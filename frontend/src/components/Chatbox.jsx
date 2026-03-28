import { useState, useEffect, useContext } from "react";
import socket from "../services/socket";
import { LanguageContext } from "../context/LanguageContext";

function ChatBox({ jobId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const { lang, t } = useContext(LanguageContext);

  useEffect(() => {
    socket.emit("joinJob", jobId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, [jobId]);

  const send = () => {
    socket.emit("sendMessage", {
      jobId,
      senderId: "me",
      text: message,
      lang, // 🔥 send selected language
    });
    setMessage("");
  };

  const recognition = new (
    window.SpeechRecognition || window.webkitSpeechRecognition
  )();

  recognition.onresult = (e) => {
    setMessage(e.results[0][0].transcript);
  };

  return (
    <div>
      <h3>{t("chat")}</h3>

      {messages.map((m, i) => (
        <p key={i}>{m.translatedText || m.text}</p>
      ))}

      <input value={message} onChange={(e) => setMessage(e.target.value)} />

      <button onClick={send}>{t("send")}</button>

      <button onClick={() => recognition.start()}>🎤 {t("speak")}</button>
    </div>
  );
}
export default ChatBox;
