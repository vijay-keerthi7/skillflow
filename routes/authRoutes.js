import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs'; // To hide passwords safely
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js'; // <--- ADD THIS LINE
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    // 2. Hash the password (never store plain text!)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  console.log("DEBUG: Login endpoint reached!");
  try {
    console.log("DEBUG: Login endpoint reached in try block!");
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Email or Password" });

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

    // CREATE TOKEN
    // 'process.env.JWT_SECRET' is a random string you add to your .env file
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, profilepic: user.profilepic } 
    });

  } catch (error) {
    res.status(500).json({ message: "Login failed here" });
  }
});

router.get('/all-users/:myId', async (req, res) => {
  try {
    const { myId } = req.params;

    // 1. Fetch all users except yourself
    const users = await User.find({ _id: { $ne: myId } }).select('-password');

    // 2. Map through users to find relationship data
    const usersWithMeta = await Promise.all(
      users.map(async (user) => {
        // Find the most recent message between you and this user
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: myId, receiverId: user._id },
            { senderId: user._id, receiverId: myId }
          ]
        }).sort({ createdAt: -1 });

        // Count unread messages sent BY this user TO you
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: myId,
          status: { $ne: 'read' }
        });

        return {
          ...user._doc, // Spreads original user data
          lastMessage: lastMsg ? lastMsg.text : "No messages yet",
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          unreadCount: unreadCount
        };
      })
    );

    // 3. Sort by lastMessageTime (Newest chats at the top)
    usersWithMeta.sort((a, b) => {
  return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
});
res.status(200).json(usersWithMeta);
  } catch (error) {
    console.error("Error fetching users with meta:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});




// routes/authRoutes.js
router.put('/update-profile', async (req, res) => {
  try {
    const { userId, name, profilepic, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, profilepic, bio },
      { new: true } // Returns the updated document
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Update failed", error });
  }
});

export default router;