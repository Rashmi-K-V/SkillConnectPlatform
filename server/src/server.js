import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import http from 'http';


const PORT = process.env.PORT || 5000;

await connectDB();

const server = http.createServer(app);
initSocket(server);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});