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

/* ---------------- ES MODULE dirname fix ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------- CORS (SAFE & DYNAMIC) ---------------- */
app.use(
  cors({
    origin: true, // allow same-origin + Azure domain automatically
    credentials: true,
  })
);

/* ---------------- HTTP & SOCKET SETUP ---------------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

export { io };

/* ---------------- SOCKET LOGIC ---------------- */
const userSocketMap = {};

io.on("connection", (socket) => {
  const { userId } = socket.handshake.query;

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User connected: ${userId}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ senderId, receiverId }) => {
    const target = userSocketMap[receiverId];
    if (target) io.to(target).emit("typing", { senderId });
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const target = userSocketMap[receiverId];
    if (target) io.to(target).emit("stopTyping", { senderId });
  });

  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, status: { $ne: "read" } },
        { $set: { status: "read" } }
      );

      const target = userSocketMap[senderId];
      if (target) io.to(target).emit("messagesRead", { readerId: receiverId });
    } catch (err) {
      console.error("Read receipt error:", err);
    }
  });

  socket.on("updateProfile", (updatedUser) => {
    socket.broadcast.emit("userProfileUpdated", updatedUser);
  });

  socket.on("deleteMessage", async ({ messageId, receiverId }) => {
    try {
      await Message.findByIdAndDelete(messageId);

      const target = userSocketMap[receiverId];
      if (target) io.to(target).emit("messageDeleted", { messageId });

      socket.emit("messageDeleted", { messageId });
    } catch (err) {
      console.error("Delete message error:", err);
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      console.log(`❌ User disconnected: ${userId}`);
    }
  });
});

/* ---------------- DATABASE ---------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

/* ---------------- API ROUTES ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ---------------- FRONTEND SERVING (IMPORTANT FIX) ---------------- */
const frontendPath = path.join(__dirname, "frontend", "build");

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ---------------- SERVER START ---------------- */
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
