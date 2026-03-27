import { Server } from "socket.io";

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