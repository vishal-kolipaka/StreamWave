FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create upload directories
RUN mkdir -p uploads/processed/thumbs

EXPOSE 5000

CMD ["npm", "start"]
