import http from "http";
import app  from "./app.js";
import connectDB  from "./config/db.js";
import { initSocket } from "./socket/socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

// Init socket.io and export so controllers can use it
export const { io, userSockets } = initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});