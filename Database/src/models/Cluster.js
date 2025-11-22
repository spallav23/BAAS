const mongoose = require('mongoose');

const indexSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    enum: [1, -1],
    default: 1,
  },
  unique: {
    type: Boolean,
    default: false,
  },
});

const schemaFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['String', 'Number', 'Boolean', 'Date', 'Array', 'Object', 'Mixed'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  default: mongoose.Schema.Types.Mixed,
  enum: [String],
});

const clusterSchema = new mongoose.Schema(
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
    collectionName: {
      type: String,
      required: true,
      unique: true,
    },
    // Optional schema definition
    schema: {
      fields: [schemaFieldSchema],
      strict: {
        type: Boolean,
        default: false,
      },
    },
    // Indexes configuration
    indexes: [indexSchema],
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
    documentCount: {
      type: Number,
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

// Generate collection name based on userId and slug
clusterSchema.pre('save', function (next) {
  if (!this.collectionName) {
    this.collectionName = `cluster_${this.userId}_${this.slug}`;
  }
  next();
});

// Create slug from name
clusterSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Cluster', clusterSchema);

