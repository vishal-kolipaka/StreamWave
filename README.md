# Stream Wave

Stream Wave is a modern social media and streaming platform allowing users to share videos, music, blogs, and images.

## Features
- 📱 **Rich Media Support**: Video (HLS), Audio, Images, Blogs
- 💬 **Real-time Messaging**: Chat with friends instantly
- 🔔 **Notifications**: Likes, comments, and follows
- 🔍 **Discovery**: Explore content by category
- 🎨 **Modern UI**: Sleek, responsive design with Dark Mode support

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB, Redis
- **Media**: FFmpeg, Bull Queue

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev without Docker)

### Running with Docker (Recommended)

1. **Start Services**
   ```bash
   docker-compose up -d
   ```
   This starts MongoDB, Redis, and the Backend Server.

2. **Seed Data**
   ```bash
   # Run the seed script inside the server container
   docker-compose exec server npm run seed
   ```

3. **Start Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Access the app at `http://localhost:5173`

### Manual Setup

1. **Backend**
   ```bash
   cd server
   cp .env.example .env
   npm install
   
   # Start dependencies (Mongo/Redis) if not running
   # npm run dev
   ```

2. **Worker (for media processing)**
   ```bash
   cd server
   npm run worker
   ```

3. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## Key Commands

### Seed Data
Populates the database with sample users and posts.
```bash
cd server
npm run seed
```
**Sample Credentials:**
- `alice_wonder` / `password123`
- `bob_builder` / `password123`

### Media Processing
The app uses a background worker to process uploads.
- **Video**: Transcoded to HLS (.m3u8) + MP4 fallback
- **Audio**: Converted to MP3 + Waveform
- **Images**: Resized

**FFmpeg Commands Used:**
```bash
# HLS Generation
ffmpeg -i input.mp4 -profile:v baseline -level 3.0 -start_number 0 -hls_time 6 -hls_list_size 0 -f hls output.m3u8

# Thumbnail
ffmpeg -i input.mp4 -ss 00:00:02.000 -vframes 1 thumb.jpg
```

## API Documentation

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts/feed` - Get home feed
- `POST /api/posts` - Create post
- `POST /api/media/init` - Start upload

### Users
- `GET /api/users/:id` - Get profile
- `POST /api/users/:id/follow` - Follow user

## License
MIT
