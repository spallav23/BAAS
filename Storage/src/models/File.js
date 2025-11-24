const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    bucketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bucket',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    // Optional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Public URL (if public access)
    publicUrl: {
      type: String,
    },
    // Access settings
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
fileSchema.index({ bucketId: 1, createdAt: -1 });
fileSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);

