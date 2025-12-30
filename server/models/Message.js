import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  time: { 
    type: String, 
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  }
}, { timestamps: true }); // This automatically adds 'createdAt' and 'updatedAt'

const Message = mongoose.model('Message', messageSchema);
export default Message;