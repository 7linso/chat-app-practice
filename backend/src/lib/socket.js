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

const sessions = new Map();

function broadcastOnline() {
  io.emit("onlineUsers", Array.from(sessions.keys()));
}

export function getReceiverSocketId(userId) {
  return sessions.get(userId);
}

io.use((socket, next) => {
  const userId = socket.handshake.auth?.userId;
  if (!userId) return next(new Error("unauthorized"));
  socket.data.userId = userId;
  next();
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  const prev = sessions.get(userId);
  if (prev && prev !== socket.id)
    io.sockets.sockets.get(prev)?.disconnect(true);

  sessions.set(userId, socket.id);
  socket.join(`user:${userId}`); // useful for targeted emits
  broadcastOnline();

  console.log("Connected", socket.id, "user:", userId);

  socket.on("disconnect", () => {
    if (sessions.get(userId) === socket.id) {
      sessions.delete(userId);
      broadcastOnline();
    }
    console.log("Disconnected", socket.id);
  });
});

export { io, app, server };
