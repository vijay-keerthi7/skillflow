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
const frontendPath = path.resolve(__dirname, "frontend", "build");

// 1. Force Azure to find the JS/CSS files by explicitly mapping the static folder
app.use("/static", express.static(path.join(frontendPath, "static")));

// 2. Serve the rest of the build folder (favicons, manifest, etc.)
app.use(express.static(frontendPath));

// 3. FALLBACK: Only serve index.html if the request is NOT for a file (no dot in filename)
// and NOT an API call. This prevents serving HTML for missing .js files.
app.get(/^(?!\/api|.*\.).+/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// For the root path "/"
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ----------- Start Server -----------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});