// server/src/socket/socket.js
import { Server } from "socket.io";
import Message from "../models/Message.js";
import { translateText } from "../services/translation.services.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {

    // Join a job room (both client and worker join same room)
    socket.on("joinJob", (jobId) => {
      socket.join(jobId);
    });

    // Chat messages
    socket.on("sendMessage", async ({ jobId, senderId, text, lang }) => {
      try {
        const message = await Message.create({ jobId, senderId, text });
        const translated = lang ? await translateText(text, lang) : text;
        io.to(jobId).emit("receiveMessage", {
          ...message._doc,
          translatedText: translated
        });
      } catch (err) {
        console.error("Socket message error:", err);
      }
    });

    // Job status updates (emit from controller via io)
    socket.on("jobStatusUpdate", ({ jobId, status, price }) => {
      io.to(jobId).emit("jobStatusChanged", { jobId, status, price });
    });

  });
};

// Export io so controllers can emit events
export const getIO = () => io;