import { io } from "socket.io-client";

// connect to backend (port 3000)
const socket = io("http://localhost:3000", {
  autoConnect: true,
  transports: ["websocket"],

  // optional but good
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;