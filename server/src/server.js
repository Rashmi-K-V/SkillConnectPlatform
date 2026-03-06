import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port {process.env.PORT || 5000}`);
});