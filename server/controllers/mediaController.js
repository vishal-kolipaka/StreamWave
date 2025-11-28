import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Queue from 'bull';
import MediaJob from '../models/MediaJob.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize S3 Client (Optional)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

// Initialize Bull Queue
const mediaQueue = new Queue('media processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

export const uploadMedia = async (req, res) => {
  try {
    const { mediaType, filename } = req.body;

    // Create MediaJob
    const mediaJob = new MediaJob({
      userId: req.user._id,
      mediaType,
      originalFile: {
        filename,
        // If using local upload, this will be updated after file upload
        // If using S3, this is the key
      }
    });

    await mediaJob.save();

    // Determine upload strategy based on env or request
    const useS3 = process.env.USE_S3 === 'true';

    if (useS3) {
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `uploads/${req.user._id}/${mediaJob._id}-${filename}`,
        ContentType: req.body.contentType
      });

      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      res.json({
        jobId: mediaJob._id,
        uploadUrl: presignedUrl,
        strategy: 's3',
        key: `uploads/${req.user._id}/${mediaJob._id}-${filename}`
      });
    } else {
      // Local upload strategy
      res.json({
        jobId: mediaJob._id,
        uploadUrl: `/api/media/upload/${mediaJob._id}`, // Endpoint to POST file to
        strategy: 'local'
      });
    }
  } catch (error) {
    console.error('Upload media init error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const handleLocalUpload = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const mediaJob = await MediaJob.findById(jobId);
    if (!mediaJob) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Job not found' });
    }

    // Update job with file info
    mediaJob.originalFile = {
      filename: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size
    };
    mediaJob.status = 'queued';
    await mediaJob.save();

    // Add to processing queue
    mediaQueue.add({ jobId: mediaJob._id });

    res.json({ message: 'File uploaded and queued for processing', jobId });
  } catch (error) {
    console.error('Local upload error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const job = await MediaJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get job status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
