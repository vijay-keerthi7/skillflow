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
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now your existing code will work:
const buildPath = path.join(__dirname, "..", "frontend", "build");

dotenv.config();
const app = express();

// 1. GLOBAL SETTINGS (Crucial for Camera/Images)
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json({ limit: '15mb' })); 
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// 2. SOCKET SETUP & USER TRACKING
const userSocketMap = {}; // { userId: socketId }

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Export so routes/controllers can use them
export { io, userSocketMap };

// 3. SOCKET EVENT LISTENERS
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        console.log(`✅ User connected: ${userId}`);
    }

    // Online Users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // --- TYPING INDICATORS ---
    socket.on("typing", ({ senderId, receiverId }) => {
        const target = userSocketMap[receiverId];
        if (target) io.to(target).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
        const target = userSocketMap[receiverId];
        if (target) io.to(target).emit("stopTyping", { senderId });
    });

    // --- READ RECEIPTS ---
    socket.on("markAsRead", async ({ senderId, receiverId }) => {
        try {
            await Message.updateMany(
                { senderId, receiverId, status: { $ne: 'read' } },
                { $set: { status: 'read' } }
            );
            const target = userSocketMap[senderId];
            if (target) io.to(target).emit("messagesRead", { readerId: receiverId });
        } catch (err) {
            console.error("Read Receipt Error:", err);
        }
    });

    // --- PROFILE UPDATES ---
    socket.on("updateProfile", (updatedUser) => {
        socket.broadcast.emit("userProfileUpdated", updatedUser);
    });

    // --- DELETE MESSAGE ---
    socket.on("deleteMessage", async ({ messageId, receiverId }) => {
        try {
            await Message.findByIdAndDelete(messageId);
            const target = userSocketMap[receiverId];
            if (target) io.to(target).emit("messageDeleted", { messageId });
            socket.emit("messageDeleted", { messageId });
        } catch (err) {
            console.error("Delete Error:", err);
        }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            console.log(`❌ User disconnected: ${userId}`);
        }
    });
});

// 4. DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to SkillFlow Database ✅"))
    .catch((err) => console.log("DB Connection Error: ", err));

// 5. ROUTES
app.get('/', (req, res) => res.send('SkillFlow Real-time Server Running! 🚀'));
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);



const buildPath = path.join(__dirname, "..", "frontend", "build");

app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// 6. SERVER START
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});