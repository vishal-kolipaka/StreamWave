import mongoose from 'mongoose';

const mediaJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  originalFile: {
    filename: String,
    path: String,
    mimeType: String,
    size: Number
  },
  output: {
    hlsPlaylist: String,
    mp4Url: String,
    thumbnails: [String],
    waveform: String, // for audio
    duration: Number
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  progress: {
    type: Number,
    default: 0
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

export default mongoose.model('MediaJob', mediaJobSchema);
