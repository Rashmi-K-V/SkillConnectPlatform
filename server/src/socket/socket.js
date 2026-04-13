// src/socket.js  (backend)
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Map userId -> socketId for targeted notifications
const userSockets = new Map();

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload._id.toString();
      socket.role   = payload.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    userSockets.set(socket.userId, socket.id);
    console.log(`Socket connected: ${socket.userId} (${socket.role})`);

    socket.on("disconnect", () => {
      userSockets.delete(socket.userId);
    });
  });

  return { io, userSockets };
}

// Call this from controllers to notify a specific user
export function notifyUser(io, userSockets, userId, event, data) {
  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
}