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
  default: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  enum: {
    type: [String],
    required: false,
  },
});

const schemaDefinitionSchema = new mongoose.Schema({
  fields: {
    type: [schemaFieldSchema],
    default: [],
  },
  strict: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

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
      type: schemaDefinitionSchema,
      default: { fields: [], strict: false },
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

clusterSchema.pre('save', function (next) {
  if (!this.collectionName) {
    this.collectionName = `cluster_${this.userId}_${this.slug}`;
  }
  next();
});

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

