const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Ensure uploads directory exists
const uploadsDir = process.env.UPLOADS_DIR || './uploads';
fs.ensureDirSync(uploadsDir);

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const bucket = req.bucket;
    if (!bucket) {
      return cb(new Error('Bucket not found'));
    }

    const bucketDir = path.join(uploadsDir, bucket.storagePath);
    await fs.ensureDir(bucketDir);
    cb(null, bucketDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter - will check file types in controller after upload
const fileFilter = (req, file, cb) => {
  // File type checking will be done in the controller
  // since we need bucket info which is set by checkBucketAccess middleware
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB default (can be overridden by bucket.maxFileSize)
  },
});

// Middleware to check file size based on bucket settings
const checkFileSize = (req, res, next) => {
  // This will be checked in the controller after file is uploaded
  // Multer doesn't support dynamic limits per request
  next();
};

module.exports = { upload, checkFileSize };

