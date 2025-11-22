const Bucket = require('../models/Bucket');
const { publishEvent } = require('../config/kafka');
const { getRedisClient } = require('../config/redis');
const fs = require('fs-extra');
const path = require('path');

// Create bucket
const createBucket = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found. Please ensure you are authenticated.' });
    }

    const { name, description, allowedFileTypes, maxFileSize, readAccess, writeAccess } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Bucket name is required' });
    }

    // Generate slug from name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure slug is unique for this user
    const existingBucket = await Bucket.findOne({ userId: req.userId, slug });
    if (existingBucket) {
      slug = `${slug}-${Date.now()}`;
    }

    const storagePath = `bucket_${req.userId}_${slug}`;

    // Create storage directory
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const bucketDir = path.join(uploadsDir, storagePath);
    await fs.ensureDir(bucketDir);

    // Create bucket
    const bucket = new Bucket({
      userId: req.userId,
      name,
      slug,
      description,
      storagePath,
      allowedFileTypes: allowedFileTypes || [],
      maxFileSize: maxFileSize || 10 * 1024 * 1024, // 10MB default
      readAccess: readAccess || 'private',
      writeAccess: writeAccess || 'private',
    });

    await bucket.save();

    // Publish bucket created event
    await publishEvent('storage-events', {
      type: 'BUCKET_CREATED',
      bucketId: bucket._id.toString(),
      userId: req.userId,
      name: bucket.name,
      storagePath: bucket.storagePath,
    });

    res.status(201).json({
      message: 'Bucket created successfully',
      bucket: {
        id: bucket._id,
        name: bucket.name,
        slug: bucket.slug,
        description: bucket.description,
        storagePath: bucket.storagePath,
        readAccess: bucket.readAccess,
        writeAccess: bucket.writeAccess,
        fileCount: bucket.fileCount,
        totalSize: bucket.totalSize,
        apiEndpoint: `/api/storage/buckets/${bucket._id}/files`,
        createdAt: bucket.createdAt,
      },
    });
  } catch (error) {
    console.error('Create bucket error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bucket with this name already exists' });
    }
    res.status(500).json({ error: 'Server error during bucket creation' });
  }
};

// List all buckets for user
const listBuckets = async (req, res) => {
  try {
    const buckets = await Bucket.find({
      userId: req.userId,
      isActive: true,
    }).select('-__v').sort({ createdAt: -1 });

    const bucketsData = buckets.map((bucket) => ({
      id: bucket._id,
      name: bucket.name,
      slug: bucket.slug,
      description: bucket.description,
      fileCount: bucket.fileCount,
      totalSize: bucket.totalSize,
      readAccess: bucket.readAccess,
      writeAccess: bucket.writeAccess,
      apiEndpoint: `/api/storage/buckets/${bucket._id}/files`,
      createdAt: bucket.createdAt,
      updatedAt: bucket.updatedAt,
    }));

    res.json({
      buckets: bucketsData,
      count: bucketsData.length,
    });
  } catch (error) {
    console.error('List buckets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get bucket details
const getBucket = async (req, res) => {
  try {
    const bucket = await Bucket.findById(req.params.bucketId).select('-__v');

    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    res.json({
      bucket: {
        id: bucket._id,
        name: bucket.name,
        slug: bucket.slug,
        description: bucket.description,
        storagePath: bucket.storagePath,
        allowedFileTypes: bucket.allowedFileTypes,
        maxFileSize: bucket.maxFileSize,
        fileCount: bucket.fileCount,
        totalSize: bucket.totalSize,
        readAccess: bucket.readAccess,
        writeAccess: bucket.writeAccess,
        apiEnabled: bucket.apiEnabled,
        apiEndpoint: `/api/storage/buckets/${bucket._id}/files`,
        createdAt: bucket.createdAt,
        updatedAt: bucket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get bucket error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid bucket ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Update bucket
const updateBucket = async (req, res) => {
  try {
    const { name, description, allowedFileTypes, maxFileSize, readAccess, writeAccess, apiEnabled } = req.body;
    const bucketId = req.params.bucketId;

    const bucket = await Bucket.findById(bucketId);
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    // Check ownership
    if (bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this bucket' });
    }

    // Update fields
    if (name !== undefined) bucket.name = name;
    if (description !== undefined) bucket.description = description;
    if (allowedFileTypes !== undefined) bucket.allowedFileTypes = allowedFileTypes;
    if (maxFileSize !== undefined) bucket.maxFileSize = maxFileSize;
    if (readAccess !== undefined) bucket.readAccess = readAccess;
    if (writeAccess !== undefined) bucket.writeAccess = writeAccess;
    if (apiEnabled !== undefined) bucket.apiEnabled = apiEnabled;

    await bucket.save();

    // Publish bucket updated event
    await publishEvent('storage-events', {
      type: 'BUCKET_UPDATED',
      bucketId: bucket._id.toString(),
      userId: req.userId,
    });

    res.json({
      message: 'Bucket updated successfully',
      bucket: {
        id: bucket._id,
        name: bucket.name,
        slug: bucket.slug,
        description: bucket.description,
        readAccess: bucket.readAccess,
        writeAccess: bucket.writeAccess,
        updatedAt: bucket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update bucket error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
};

// Delete bucket
const deleteBucket = async (req, res) => {
  try {
    const bucketId = req.params.bucketId;

    const bucket = await Bucket.findById(bucketId);
    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    // Check ownership
    if (bucket.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this bucket' });
    }

    // Delete all files in the bucket
    const File = require('../models/File');
    const files = await File.find({ bucketId });
    
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    const bucketDir = path.join(uploadsDir, bucket.storagePath);

    // Delete physical files
    for (const file of files) {
      try {
        await fs.remove(file.filePath);
      } catch (error) {
        console.error(`Error deleting file ${file.filePath}:`, error);
      }
    }

    // Delete bucket directory
    try {
      await fs.remove(bucketDir);
    } catch (error) {
      console.error(`Error deleting bucket directory ${bucketDir}:`, error);
    }

    // Delete file records
    await File.deleteMany({ bucketId });

    // Delete bucket
    await Bucket.findByIdAndDelete(bucketId);

    // Publish bucket deleted event
    await publishEvent('storage-events', {
      type: 'BUCKET_DELETED',
      bucketId: bucketId,
      userId: req.userId,
    });

    res.json({ message: 'Bucket deleted successfully' });
  } catch (error) {
    console.error('Delete bucket error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
};

module.exports = {
  createBucket,
  listBuckets,
  getBucket,
  updateBucket,
  deleteBucket,
};

