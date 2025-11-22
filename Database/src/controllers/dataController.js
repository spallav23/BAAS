const Cluster = require('../models/Cluster');
const { getDynamicModel } = require('../utils/dynamicModel');
const { getRedisClient } = require('../config/redis');
const { publishEvent } = require('../config/kafka');

// Build query from request filters
const buildQuery = (req) => {
  const query = {};
  const { filter, search, ...otherParams } = req.query;

  // Parse filter if provided as JSON string
  if (filter) {
    try {
      const filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
      Object.assign(query, filterObj);
    } catch (error) {
      console.error('Error parsing filter:', error);
    }
  }

  // Add other query parameters as filters
  Object.keys(otherParams).forEach((key) => {
    if (!['page', 'limit', 'sort', 'select'].includes(key)) {
      query[key] = otherParams[key];
    }
  });

  // Text search (if supported)
  if (search) {
    query.$text = { $search: search };
  }

  return query;
};

// Create document
const createDocument = async (req, res) => {
  try {
    const cluster = req.cluster;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Write access check (handled in middleware, but verify here)
    if (cluster.writeAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    const document = new DynamicModel(req.body);
    await document.save();

    // Update cluster document count
    await Cluster.findByIdAndUpdate(cluster._id, {
      $inc: { documentCount: 1 },
    });

    // Clear cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`cluster:${cluster._id}:count`);
    } catch (error) {
      // Redis might not be available
    }

    // Publish document created event
    await publishEvent('cluster-events', {
      type: 'DOCUMENT_CREATED',
      clusterId: cluster._id.toString(),
      userId: req.userId || cluster.userId,
      documentId: document._id.toString(),
    });

    res.status(201).json({
      message: 'Document created successfully',
      document,
    });
  } catch (error) {
    console.error('Create document error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ error: 'Server error during document creation' });
  }
};

// List documents
const listDocuments = async (req, res) => {
  try {
    const cluster = req.cluster;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Read access check (handled in middleware, but verify here)
    if (cluster.readAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Read access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    // Build query
    const query = buildQuery(req);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach((field) => {
        const direction = field.startsWith('-') ? -1 : 1;
        const fieldName = field.replace(/^-/, '');
        sort[fieldName] = direction;
      });
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    // Field selection
    const select = req.query.select ? req.query.select.replace(/,/g, ' ') : '';

    // Execute query
    const [documents, total] = await Promise.all([
      DynamicModel.find(query).select(select).sort(sort).skip(skip).limit(limit).lean(),
      DynamicModel.countDocuments(query),
    ]);

    res.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get document by ID
const getDocument = async (req, res) => {
  try {
    const cluster = req.cluster;
    const { documentId } = req.params;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Read access check (handled in middleware, but verify here)
    if (cluster.readAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Read access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    const document = await DynamicModel.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const cluster = req.cluster;
    const { documentId } = req.params;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Write access check (handled in middleware, but verify here)
    if (cluster.writeAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    const document = await DynamicModel.findByIdAndUpdate(
      documentId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Publish document updated event
    await publishEvent('cluster-events', {
      type: 'DOCUMENT_UPDATED',
      clusterId: cluster._id.toString(),
      userId: req.userId || cluster.userId,
      documentId: documentId,
    });

    res.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    console.error('Update document error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Partial update document
const patchDocument = async (req, res) => {
  try {
    const cluster = req.cluster;
    const { documentId } = req.params;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Write access check (handled in middleware, but verify here)
    if (cluster.writeAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    const document = await DynamicModel.findByIdAndUpdate(
      documentId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Publish document updated event
    await publishEvent('cluster-events', {
      type: 'DOCUMENT_UPDATED',
      clusterId: cluster._id.toString(),
      userId: req.userId || cluster.userId,
      documentId: documentId,
    });

    res.json({
      message: 'Document updated successfully',
      document,
    });
  } catch (error) {
    console.error('Patch document error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: Object.values(error.errors).map((e) => e.message),
      });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const cluster = req.cluster;
    const { documentId } = req.params;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Write access check (handled in middleware, but verify here)
    if (cluster.writeAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    const document = await DynamicModel.findByIdAndDelete(documentId);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Update cluster document count
    await Cluster.findByIdAndUpdate(cluster._id, {
      $inc: { documentCount: -1 },
    });

    // Clear cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`cluster:${cluster._id}:count`);
    } catch (error) {
      // Redis might not be available
    }

    // Publish document deleted event
    await publishEvent('cluster-events', {
      type: 'DOCUMENT_DELETED',
      clusterId: cluster._id.toString(),
      userId: req.userId,
      documentId: documentId,
    });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid document ID' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete multiple documents
const deleteDocuments = async (req, res) => {
  try {
    const cluster = req.cluster;

    if (!cluster.apiEnabled) {
      return res.status(403).json({ error: 'API is disabled for this cluster' });
    }

    // Write access check (handled in middleware, but verify here)
    if (cluster.writeAccess === 'private' && (!req.userId || cluster.userId !== req.userId)) {
      return res.status(403).json({ error: 'Write access denied' });
    }

    const DynamicModel = getDynamicModel(
      cluster.collectionName,
      cluster.schema,
      cluster.schema?.strict || false
    );

    // Build query from filters
    const query = buildQuery(req);

    const result = await DynamicModel.deleteMany(query);

    // Update cluster document count
    await Cluster.findByIdAndUpdate(cluster._id, {
      $inc: { documentCount: -result.deletedCount },
    });

    // Clear cache
    try {
      const redisClient = getRedisClient();
      await redisClient.del(`cluster:${cluster._id}:count`);
    } catch (error) {
      // Redis might not be available
    }

    // Publish documents deleted event
    await publishEvent('cluster-events', {
      type: 'DOCUMENTS_DELETED',
      clusterId: cluster._id.toString(),
      userId: req.userId || cluster.userId,
      count: result.deletedCount,
    });

    res.json({
      message: 'Documents deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete documents error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  patchDocument,
  deleteDocument,
  deleteDocuments,
};

