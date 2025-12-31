import express from 'express';
import Message from '../models/Message.js';
// Make sure this path correctly points to your index.js
import { io, userSocketMap } from '../index.js'; 

const router = express.Router();

// --- 1. GET MESSAGES ---
router.get('/:myId/:partnerId', async (req, res) => {
  try {
    const { myId, partnerId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read when opening the chat
    await Message.updateMany(
      { senderId: partnerId, receiverId: myId, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );

    const partnerSocketId = userSocketMap[partnerId];
    if (partnerSocketId) {
      io.to(partnerSocketId).emit('messagesRead', { readerId: myId }); 
    }
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// --- 2. SEND MESSAGE (The "Real-time" Engine) ---
router.post('/send/:id', async (req, res) => {
  try {
    const { text, senderId, image } = req.body; 
    const receiverId = req.params.id;

    // Validation
    if (!text?.trim() && !image) {
      return res.status(400).json({ message: "Cannot send empty message" });
    }

    const receiverSocketId = userSocketMap[receiverId];
    const senderSocketId = userSocketMap[senderId]; 
    
    // Set status based on whether receiver is online right now
    const initialStatus = receiverSocketId ? 'delivered' : 'sent';

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "",
      image: image || null,
      status: initialStatus
    });

    await newMessage.save();

    // EMIT TO RECEIVER (Instant message for them)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    // EMIT TO SENDER (This solves your "refresh" problem!)
    // This tells the sender's UI: "The server saved your message, show it now."
    if (senderSocketId) {
      io.to(senderSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Message Send Error:", error); 
    res.status(500).json({ message: "Error sending message" });
  }
});

export default router;