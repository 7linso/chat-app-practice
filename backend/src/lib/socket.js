import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const FRONTENDS = ["http://localhost:5173", "http://localhost:3000"];

const io = new Server(server, {
  cors: {
    origin: FRONTENDS,
    credentials: true,
  },
  path: "/socket.io",
});

io.use((socket, next) => {
  const userId = socket.handshake.auth?.userId;
  if (!userId) return next(new Error("unauthorized"));
  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  console.log(`Connected  ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Disconnected  ${socket.id}`);
  });
});

export { io, app, server };
