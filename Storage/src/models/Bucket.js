const mongoose = require('mongoose');

const bucketSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Storage path for this bucket
    storagePath: {
      type: String,
      required: true,
      unique: true,
    },
    // File type restrictions (optional)
    allowedFileTypes: {
      type: [String],
      default: [],
    },
    maxFileSize: {
      type: Number, // in bytes
      default: 10 * 1024 * 1024, // 10MB default
    },
    // API settings
    apiEnabled: {
      type: Boolean,
      default: true,
    },
    readAccess: {
      type: String,
      enum: ['public', 'private', 'authenticated'],
      default: 'private',
    },
    writeAccess: {
      type: String,
      enum: ['public', 'private', 'authenticated'],
      default: 'private',
    },
    // Statistics
    fileCount: {
      type: Number,
      default: 0,
    },
    totalSize: {
      type: Number, // in bytes
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

bucketSchema.pre('save', function (next) {
  if (!this.storagePath) {
    this.storagePath = `bucket_${this.userId}_${this.slug}`;
  }
  next();
});

bucketSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Bucket', bucketSchema);

