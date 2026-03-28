import { Server } from "socket.io";
import Message from "../models/Message.js";
import { translateText } from "../services/translation.service.js";

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {

    socket.on("joinJob", (jobId) => {
      socket.join(jobId);
    });

    socket.on("sendMessage", async ({ jobId, senderId, text, lang }) => {

      const message = await Message.create({
        jobId,
        senderId,
        text
      });

      // 🔥 translate before sending
      const translated = await translateText(text, lang);

      io.to(jobId).emit("receiveMessage", {
        ...message._doc,
        translatedText: translated
      });
    });

  });
};

export { initSocket };