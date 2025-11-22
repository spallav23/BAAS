const File = require('../models/File');
const Bucket = require('../models/Bucket');
const { publishEvent } = require('../config/kafka');
const { getRedisClient } = require('../config/redis');
const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

// Upload file
const uploadFile = async (req, res) => {
  try {
    const bucket = req.bucket;

    if (!bucket.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this bucket' });
    }

    if (bucket.writeAccess === 'private' && bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check file type restrictions
    if (bucket.allowedFileTypes && bucket.allowedFileTypes.length > 0) {
      const fileExt = path.extname(req.file.originalname).toLowerCase().slice(1);
      const isAllowed = bucket.allowedFileTypes.some((allowed) => {
        return fileExt === allowed.toLowerCase() || 
               req.file.mimetype.includes(allowed.toLowerCase());
      });

      if (!isAllowed) {
        // Delete uploaded file
        await fs.remove(req.file.path);
        return res.status(400).json({ 
          error: `File type not allowed. Allowed types: ${bucket.allowedFileTypes.join(', ')}` 
        });
      }
    }

    // Check file size against bucket limit
    if (req.file.size > bucket.maxFileSize) {
      // Delete uploaded file
      await fs.remove(req.file.path);
      return res.status(400).json({ 
        error: `File size exceeds maximum allowed size of ${(bucket.maxFileSize / (1024 * 1024)).toFixed(2)} MB` 
      });
    }

    // Create file record
    const file = new File({
      bucketId: bucket._id,
      userId: req.userId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      metadata: req.body.metadata ? JSON.parse(req.body.metadata) : {},
      isPublic: bucket.readAccess === 'public',
      publicUrl: bucket.readAccess === 'public' 
        ? `/api/storage/buckets/${bucket._id}/files/${req.file.filename}/download`
        : undefined,
    });

    await file.save();

    // Update bucket statistics
    await Bucket.findByIdAndUpdate(bucket._id, {
      $inc: { 
        fileCount: 1,
        totalSize: req.file.size,
      },
    });

    // Clear cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`bucket:${bucket._id}:count`);
      await redisClient.del(`bucket:${bucket._id}:size`);
    } catch (error) {
      // Redis might not be available
    }

    // Publish file uploaded event
    await publishEvent('storage-events', {
      type: 'FILE_UPLOADED',
      bucketId: bucket._id.toString(),
      userId: req.userId,
      fileId: file._id.toString(),
      fileName: file.originalName,
      fileSize: file.size,
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file._id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        publicUrl: file.publicUrl,
        createdAt: file.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload file error:', error);
    // Clean up uploaded file if record creation failed
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    res.status(500).json({ error: 'Server error during file upload' });
  }
};

// List files
const listFiles = async (req, res) => {
  try {
    const bucket = req.bucket;

    if (!bucket.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this bucket' });
    }

    if (bucket.readAccess === 'private' && bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Read access denied' });
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = { bucketId: bucket._id };
    
    // Filter by user if not public
    if (bucket.readAccess === 'private') {
      query.userId = req.userId;
    }

    // Search by filename
    if (req.query.search) {
      query.originalName = { $regex: req.query.search, $options: 'i' };
    }

    // Execute query
    const [files, total] = await Promise.all([
      File.find(query)
        .select('-filePath')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      File.countDocuments(query),
    ]);

    res.json({
      files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get file details
const getFile = async (req, res) => {
  try {
    const bucket = req.bucket;
    const { fileId } = req.params;

    if (!bucket.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this bucket' });
    }

    if (bucket.readAccess === 'private' && bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Read access denied' });
    }

    const file = await File.findById(fileId);

    if (!file || file.bucketId.toString() !== bucket._id.toString()) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    console.error('Get file error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const bucket = req.bucket;
    const { fileName } = req.params;

    if (!bucket.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this bucket' });
    }

    // Find file by filename
    const file = await File.findOne({ 
      bucketId: bucket._id,
      fileName: fileName,
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access
    if (bucket.readAccess === 'private' && file.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file exists on disk
    if (!await fs.pathExists(file.filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    // Set headers
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size);

    // Stream file
    const fileStream = fs.createReadStream(file.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const bucket = req.bucket;
    const { fileId } = req.params;

    if (!bucket.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this bucket' });
    }

    if (bucket.writeAccess === 'private' && bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const file = await File.findById(fileId);

    if (!file || file.bucketId.toString() !== bucket._id.toString()) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete physical file
    try {
      await fs.remove(file.filePath);
    } catch (error) {
      console.error(`Error deleting file ${file.filePath}:`, error);
    }

    // Delete file record
    await File.findByIdAndDelete(fileId);

    // Update bucket statistics
    await Bucket.findByIdAndUpdate(bucket._id, {
      $inc: { 
        fileCount: -1,
        totalSize: -file.size,
      },
    });

    // Clear cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`bucket:${bucket._id}:count`);
      await redisClient.del(`bucket:${bucket._id}:size`);
    } catch (error) {
      // Redis might not be available
    }

    // Publish file deleted event
    await publishEvent('storage-events', {
      type: 'FILE_DELETED',
      bucketId: bucket._id.toString(),
      userId: req.userId,
      fileId: fileId,
    });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadFile,
  listFiles,
  getFile,
  downloadFile,
  deleteFile,
};

