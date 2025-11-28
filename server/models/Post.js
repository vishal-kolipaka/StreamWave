import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'blog'],
    required: true
  },
  title: {
    type: String,
    maxlength: 200
  },
  caption: {
    type: String,
    maxlength: 2200
  },
  media: {
    url: String,
    thumbnail: String,
    meta: {
      duration: Number, // in seconds
      size: Number, // in bytes
      mime: String,
      width: Number,
      height: Number
    }
  },
  tags: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  shares: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for feed queries
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

postSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Post', postSchema);
