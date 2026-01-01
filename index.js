import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';

// --- ES MODULE FIX FOR __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// --- 1. MIDDLEWARE & DYNAMIC CORS ---
// If on Azure, we allow the Azure URL, otherwise localhost
const allowedOrigin = process.env.NODE_ENV === 'production' 
    ? "https://whatsap2-fwagd4daahanfqaw.ukwest-01.azurewebsites.net/api" 
    : "http://localhost:3000";

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '15mb' })); 
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// --- 2. SOCKET SETUP & USER TRACKING ---
const userSocketMap = {}; 

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigin,
        methods: ["GET", "POST"]
    }
});

export { io, userSocketMap };

// --- 3. SOCKET EVENT LISTENERS ---
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
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
                { senderId, receiverId, status: { $ne: 'read' } },
                { $set: { status: 'read' } }
            );
            const target = userSocketMap[senderId];
            if (target) io.to(target).emit("messagesRead", { readerId: receiverId });
        } catch (err) {
            console.error("Read Receipt Error:", err);
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
            console.error("Delete Error:", err);
        }
    });

    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            console.log(`❌ User disconnected: ${userId}`);
        }
    });
});

// --- 4. DB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to SkillFlow Database ✅"))
    .catch((err) => console.log("DB Connection Error: ", err));

// --- 5. ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// --- 6. FRONTEND SERVING (REWRITTEN PATH) ---
// Since index.js is now in the ROOT, we go directly into frontend/build


app.use(express.static("./frontend/build"));

// 2. Explicitly serve static assets to prevent 404s
// app.use("/static", express.static(path.join(frontendPath, "static")));

// 3. Catch-all for React Router
// This ensures that any deep links (like /login or /profile) return index.html
// app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend","build","index.html"));
// });

// --- 7. SERVER START ---
const PORT = process.env.PORT || 8080; // Azure prefers 8080
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});