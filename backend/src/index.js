import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;

app.use(cookieParser());

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.use((req, res) => {
  res
    .status(404)
    .json({ message: "API route not found", path: req.originalUrl });
});

server.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
  connectDB();
});
