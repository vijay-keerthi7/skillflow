import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// Routes & Models
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import Message from "./models/Message.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });

const userSocketMap = {}; 
export { io, userSocketMap };

// ----------- Socket Logic -----------
io.on("connection", (socket) => {
  const { userId } = socket.handshake.query;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// ----------- Database -----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ----------- API Routes -----------
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ----------- Serve React Frontend -----------
// Use path.join for Windows compatibility
const frontendPath = path.join(__dirname, "frontend", "build");

// 1. Serve ALL files in the build folder
app.use(express.static(frontendPath));

// 2. Explicitly serve static assets to prevent 404s
app.use("/static", express.static(path.join(frontendPath, "static")));

// 3. Catch-all for React Router
// This ensures that any deep links (like /login or /profile) return index.html
app.get("*", (req, res) => {
  // If the request looks like a file (has a dot) and wasn't found, don't send index.html
  if (req.path.includes(".") || req.path.startsWith("/api")) {
    return res.status(404).send("Not found");
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ----------- Start Server -----------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});