import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    maxlength: 2000
  },
  attachments: [{
    type: String, // file URLs
    mimeType: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  },
  lastMessage: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for participant lookup
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessage: -1 });

export default mongoose.model('Conversation', conversationSchema);
