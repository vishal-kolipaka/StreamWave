import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'username avatarUrl')
      .sort({ lastMessage: -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.threadId)
      .populate('messages.from', 'username avatarUrl');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check participation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(conversation.messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getConversationWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot start a chat with yourself' });
    }

    const otherUser = await User.findById(userId).select('username avatarUrl bio');
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] }
    })
      .populate('participants', 'username avatarUrl')
      .populate('messages.from', 'username avatarUrl');

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.user._id, userId],
        messages: []
      });
      await conversation.save();
      await conversation.populate('participants', 'username avatarUrl');
    }

    await conversation.populate('messages.from', 'username avatarUrl');

    res.json({
      conversationId: conversation._id,
      messages: conversation.messages,
      otherUser
    });
  } catch (error) {
    console.error('Get direct conversation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { recipientId, text, conversationId } = req.body;
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else if (recipientId) {
      // Find existing or create new
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] }
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [req.user._id, recipientId],
          messages: []
        });
      }
    }

    if (!conversation) {
      return res.status(400).json({ message: 'Recipient or conversation ID required' });
    }

    const newMessage = {
      from: req.user._id,
      text,
      createdAt: new Date()
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = newMessage.createdAt;

    // Update unread counts
    conversation.participants.forEach(p => {
      if (p.toString() !== req.user._id.toString()) {
        const current = conversation.unreadCounts.get(p.toString()) || 0;
        conversation.unreadCounts.set(p.toString(), current + 1);
      }
    });

    await conversation.save();

    // Populate for return
    const populatedMessage = {
      ...newMessage,
      from: {
        _id: req.user._id,
        username: req.user.username,
        avatarUrl: req.user.avatarUrl
      }
    };

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
