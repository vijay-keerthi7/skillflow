import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';

dotenv.config();
const app = express();

// 1. Middleware (Must come before Routes)
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

// 2. Create HTTP Server & Initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// 3. User Tracking Logic
const userSocketMap = {}; // { userId: socketId }

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`✅ User ${userId} online (Socket: ${socket.id})`);
  }

  // Broadcast online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // --- TYPING LOGIC ---
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  // --- READ RECEIPTS LOGIC ---
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      // senderId = The one who sent the message (A)
      // receiverId = The one currently viewing the message (B)
      
      await Message.updateMany(
        { senderId: senderId, receiverId: receiverId, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      // Notify the sender (A) that their messages were read by (B)
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { readerId: receiverId });
      }
    } catch (err) {
      console.error("❌ Error in markAsRead socket:", err);
    }
  });

  // --- DISCONNECT ---
  socket.on('disconnect', () => {
    if (userId) {
      console.log(`❌ User ${userId} disconnected`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

// 4. DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to SkillFlow Database ✅"))
  .catch((err) => console.log("DB Connection Error: ", err));

// 5. Routes
app.get('/', (req, res) => res.send('SkillFlow Real-time Server Running! 🚀'));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// 6. Exports & Server Start
export { app, io, userSocketMap };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});