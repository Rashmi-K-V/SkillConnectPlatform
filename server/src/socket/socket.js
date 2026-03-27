import { Server } from "socket.io";
import Message from "../models/Message.js";
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    // Join job room
    socket.on("joinJob", (jobId) => {
      socket.join(jobId);
    });
    //send message
    socket.on("sendMessage", async ({ jobId, senderId, text }) => {
      const message = new Message({ jobId, senderId, text });
      await message.save();
      io.to(jobId).emit("receiveMessage", message);
    });
    // Worker sends location
    socket.on("workerLocation", ({ jobId, location }) => {
      io.to(jobId).emit("updateWorkerLocation", location);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

const getIo = () => io;

export { initSocket, getIo };