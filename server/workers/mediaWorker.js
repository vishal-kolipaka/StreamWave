import Queue from 'bull';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MediaJob from '../models/MediaJob.js';
import Post from '../models/Post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Create Redis connection
const mediaQueue = new Queue('media processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const processedDir = path.join(uploadsDir, 'processed');
const thumbsDir = path.join(processedDir, 'thumbs');

[uploadsDir, processedDir, thumbsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

mediaQueue.process(async (job) => {
  const { jobId } = job.data;

  try {
    const mediaJob = await MediaJob.findById(jobId).populate('userId');
    if (!mediaJob) {
      throw new Error('Media job not found');
    }

    // Update job status
    mediaJob.status = 'processing';
    mediaJob.progress = 10;
    await mediaJob.save();

    const inputPath = mediaJob.originalFile.path;
    const outputBase = path.join(
      processedDir,
      mediaJob.userId._id.toString(),
      path.parse(mediaJob.originalFile.filename).name
    );

    // Ensure user directory exists
    const userDir = path.dirname(outputBase);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    let outputUrls = {};

    if (mediaJob.mediaType === 'video') {
      outputUrls = await processVideo(inputPath, outputBase, mediaJob);
    } else if (mediaJob.mediaType === 'audio') {
      outputUrls = await processAudio(inputPath, outputBase, mediaJob);
    } else if (mediaJob.mediaType === 'image') {
      outputUrls = await processImage(inputPath, outputBase, mediaJob);
    }

    // Update job with output URLs
    mediaJob.output = outputUrls;
    mediaJob.status = 'completed';
    mediaJob.progress = 100;
    mediaJob.completedAt = new Date();
    await mediaJob.save();

    // If this media job is linked to a post, update the post with media URLs
    if (mediaJob.postId) {
      const post = await Post.findById(mediaJob.postId);
      if (post) {
        post.media = {
          url: outputUrls.mp4Url || outputUrls.imageUrl,
          thumbnail: outputUrls.thumbnails?.[0],
          meta: {
            duration: outputUrls.duration,
            size: mediaJob.originalFile.size,
            mime: mediaJob.originalFile.mimeType
          }
        };
        await post.save();
      }
    }

    return { success: true, jobId: mediaJob._id };
  } catch (error) {
    console.error('Media processing error:', error);

    // Update job status to failed
    const mediaJob = await MediaJob.findById(jobId);
    if (mediaJob) {
      mediaJob.status = 'failed';
      mediaJob.error = error.message;
      await mediaJob.save();
    }

    throw error;
  }
});

async function processVideo(inputPath, outputBase, mediaJob) {
  const output = {};

  // Generate thumbnail
  const thumbPath = `${outputBase}-thumb.jpg`;
  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -ss 00:00:02.000 -vframes 1 -q:v 2 "${thumbPath}"`
    );
    output.thumbnails = [`/uploads/processed/thumbs/${path.basename(thumbPath)}`];

    // Move thumbnail to thumbs directory
    const finalThumbPath = path.join(thumbsDir, path.basename(thumbPath));
    fs.renameSync(thumbPath, finalThumbPath);
  } catch (error) {
    console.warn('Thumbnail generation failed:', error);
  }

  // Generate HLS streams
  const hlsDir = `${outputBase}-hls`;
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const hlsPlaylist = path.join(hlsDir, 'playlist.m3u8');

  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -profile:v baseline -level 3.0 -start_number 0 ` +
      `-hls_time 6 -hls_list_size 0 -f hls "${hlsPlaylist}"`
    );

    output.hlsPlaylist = `/uploads/processed/${path.basename(outputBase)}-hls/playlist.m3u8`;
  } catch (error) {
    console.warn('HLS generation failed:', error);
  }

  // Generate MP4 fallback
  const mp4Path = `${outputBase}.mp4`;
  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "${mp4Path}"`
    );
    output.mp4Url = `/uploads/processed/${path.basename(outputBase)}.mp4`;
  } catch (error) {
    console.warn('MP4 generation failed:', error);
  }

  // Get video duration
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    );
    output.duration = Math.round(parseFloat(stdout));
  } catch (error) {
    console.warn('Duration detection failed:', error);
  }

  mediaJob.progress = 80;
  await mediaJob.save();

  return output;
}

async function processAudio(inputPath, outputBase, mediaJob) {
  const output = {};

  // Convert to MP3
  const mp3Path = `${outputBase}.mp3`;
  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -codec:a libmp3lame -b:a 192k "${mp3Path}"`
    );
    output.mp4Url = `/uploads/processed/${path.basename(outputBase)}.mp3`;
  } catch (error) {
    console.warn('MP3 conversion failed:', error);
  }

  // Generate waveform (simple approach - extract cover if exists, else generate)
  const waveformPath = `${outputBase}-waveform.jpg`;
  try {
    await execAsync(
      `ffmpeg -i "${inputPath}" -filter_complex "showwavespic=colors=#007bff:scale=lin" -frames:v 1 "${waveformPath}"`
    );
    output.thumbnails = [`/uploads/processed/thumbs/${path.basename(waveformPath)}`];

    // Move to thumbs directory
    const finalWaveformPath = path.join(thumbsDir, path.basename(waveformPath));
    fs.renameSync(waveformPath, finalWaveformPath);
  } catch (error) {
    console.warn('Waveform generation failed:', error);
  }

  // Get audio duration
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`
    );
    output.duration = Math.round(parseFloat(stdout));
  } catch (error) {
    console.warn('Duration detection failed:', error);
  }

  mediaJob.progress = 80;
  await mediaJob.save();

  return output;
}

async function processImage(inputPath, outputBase, mediaJob) {
  const output = {};

  // For images, we can create different sizes
  const sizes = [
    { suffix: 'large', size: '1200x1200' },
    { suffix: 'medium', size: '600x600' },
    { suffix: 'small', size: '300x300' }
  ];

  for (const size of sizes) {
    const outputPath = `${outputBase}-${size.suffix}.jpg`;
    try {
      await execAsync(
        `ffmpeg -i "${inputPath}" -vf "scale=${size.size}:force_original_aspect_ratio=decrease" "${outputPath}"`
      );
    } catch (error) {
      console.warn(`Image resize failed for ${size.suffix}:`, error);
    }
  }

  output.imageUrl = `/uploads/processed/${path.basename(outputBase)}-medium.jpg`;
  output.thumbnails = [`/uploads/processed/${path.basename(outputBase)}-small.jpg`];

  mediaJob.progress = 100;
  await mediaJob.save();

  return output;
}

console.log('Media worker started. Waiting for jobs...');
