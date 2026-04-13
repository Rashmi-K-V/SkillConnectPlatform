import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}