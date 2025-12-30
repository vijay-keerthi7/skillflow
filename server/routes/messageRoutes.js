import express from 'express';
import Message from '../models/Message.js';
import { io, userSocketMap } from '../index.js';

const router = express.Router();

// ROUTE: Get chat history between two users
router.get('/:myId/:partnerId', async (req, res) => {
  try {
    const { myId, partnerId } = req.params;

    // 1. Find the messages
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: partnerId },
        { senderId: partnerId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    // 2. NEW: Mark all messages RECEIVED by me as 'read'
    await Message.updateMany(
      { senderId: partnerId, receiverId: myId, status: { $ne: 'read' } },
      { $set: { status: 'read' } }
    );

    // 3. NEW: Notify the partner via socket that I've read their messages
    const partnerSocketId = userSocketMap[partnerId];
    if (partnerSocketId) {
      io.to(partnerSocketId).emit('messagesRead', { senderId: myId });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// ROUTE: Send a message
router.post('/send/:id', async (req, res) => {
  try {
    const { text, senderId } = req.body;
    const receiverId = req.params.id;

    // Check if receiver is online to set initial status
    const receiverSocketId = userSocketMap[receiverId];
    const initialStatus = receiverSocketId ? 'delivered' : 'sent';

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      status: initialStatus // Sets 'delivered' if online, else 'sent'
    });

    await newMessage.save();

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

export default router;