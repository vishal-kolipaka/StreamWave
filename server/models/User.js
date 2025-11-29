import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: '/uploads/default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for follower/following counts
userSchema.virtual('followerCount').get(function () {
  return Array.isArray(this.followers)?this.followers.length:0;
});

userSchema.virtual('followingCount').get(function () {
  return Array.isArray(this.following)?this.following.length:0;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
