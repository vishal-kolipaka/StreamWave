# Stream Wave Architecture

## Overview
Stream Wave is a full-stack social media and streaming application built with the MERN stack (MongoDB, Express, React, Node.js). It supports rich media content including video, audio, and blogs, with features like real-time messaging and background media processing.

## System Components

### 1. Client (Frontend)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (Auth)
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors for JWT
- **Real-time**: Socket.IO Client

### 2. Server (Backend)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Caching/Queue**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **File Handling**: Multer (Local) / AWS SDK (S3)

### 3. Media Processing
- **Queue**: Bull (Redis-based)
- **Worker**: Dedicated Node.js process
- **Tool**: FFmpeg
- **Capabilities**:
  - Video transcoding to HLS (HTTP Live Streaming)
  - Thumbnail generation
  - Audio waveform generation
  - Image resizing

## Data Flow

1. **User Auth**: 
   - Login -> JWT issued -> Stored in LocalStorage -> Sent in Authorization header.
2. **Media Upload**:
   - Client requests upload -> Server creates `MediaJob` -> Returns upload URL (S3 presigned or Local).
   - Client uploads file -> Server/S3 receives file.
   - Server queues job in Redis -> Worker picks up job -> Processes media -> Updates `MediaJob` with output URLs.
3. **Real-time**:
   - Socket.IO connection established on auth.
   - Events: `message`, `notification`.

## Scalability Considerations

- **CDN**: Serve `/uploads` via a CDN (e.g., CloudFront) for production.
- **Horizontal Scaling**: 
  - Stateless API server can be replicated.
  - Redis handles shared session/queue state.
  - MongoDB sharding for data growth.
- **Media Storage**: Switch to S3 for scalable object storage.

## Directory Structure

```
/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Global state (Auth)
│   │   ├── pages/         # Route pages
│   │   └── ...
├── server/                 # Node.js Backend
│   ├── controllers/       # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── workers/           # Background jobs
│   └── ...
└── docker-compose.yml     # Container orchestration
```
