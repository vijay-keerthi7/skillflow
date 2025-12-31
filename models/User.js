import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilepic: { type: String, default: "https://i.pravatar.cc/150?u=default" },
  status: { type: String, default: "offline" },
  lastseen: { type: String, default: "Just now" }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;