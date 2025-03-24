import mongoose from 'mongoose';

// Chat Schema
const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // For faster queries
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [{
    id: Number,
    type: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: String
  }],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);

export default Chat;
