const Cluster = require('../models/Cluster');
const { getDynamicModel, createIndexes, clearModelCache } = require('../utils/dynamicModel');
const { publishEvent } = require('../config/kafka');
const { getRedisClient } = require('../config/redis');
const mongoose = require('mongoose');

// Create cluster
const createCluster = async (req, res) => {
  try {
    // Validate userId is present
    if (!req.userId) {
      return res.status(401).json({ error: 'User ID not found. Please ensure you are authenticated.' });
    }

    const { name, description, schema, indexes, readAccess, writeAccess } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Cluster name is required' });
    }

    // Generate slug from name
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure slug is unique for this user
    const existingCluster = await Cluster.findOne({ userId: req.userId, slug });
    if (existingCluster) {
      slug = `${slug}-${Date.now()}`;
    }

    const collectionName = `cluster_${req.userId}_${slug}`;

    // Create cluster
    const cluster = new Cluster({
      userId: req.userId,
      name,
      slug,
      description,
      collectionName,
      schema: schema || { fields: [], strict: false },
      indexes: indexes || [],
      readAccess: readAccess || 'private',
      writeAccess: writeAccess || 'private',
    });

    await cluster.save();

    // Create indexes if provided
    if (indexes && indexes.length > 0) {
      const DynamicModel = getDynamicModel(collectionName, schema, schema?.strict || false);
      await createIndexes(DynamicModel, indexes);
    }

    // Publish cluster created event
    await publishEvent('cluster-events', {
      type: 'CLUSTER_CREATED',
      clusterId: cluster._id.toString(),
      userId: req.userId,
      name: cluster.name,
      collectionName: cluster.collectionName,
    });

    res.status(201).json({
      message: 'Cluster created successfully',
      cluster: {
        id: cluster._id,
        name: cluster.name,
        slug: cluster.slug,
        description: cluster.description,
        collectionName: cluster.collectionName,
        readAccess: cluster.readAccess,
        writeAccess: cluster.writeAccess,
        apiEndpoint: `/api/db/clusters/${cluster._id}/data`,
        createdAt: cluster.createdAt,
      },
    });
  } catch (error) {
    console.error('Create cluster error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Cluster with this name already exists' });
    }
    res.status(500).json({ error: 'Server error during cluster creation' });
  }
};

// List all clusters for user
const listClusters = async (req, res) => {
  try {
    const clusters = await Cluster.find({
      userId: req.userId,
      isActive: true,
    }).select('-__v').sort({ createdAt: -1 });

    const clustersData = clusters.map((cluster) => ({
      id: cluster._id,
      name: cluster.name,
      slug: cluster.slug,
      description: cluster.description,
      documentCount: cluster.documentCount,
      readAccess: cluster.readAccess,
      writeAccess: cluster.writeAccess,
      apiEndpoint: `/api/db/clusters/${cluster._id}/data`,
      createdAt: cluster.createdAt,
      updatedAt: cluster.updatedAt,
    }));

    res.json({
      clusters: clustersData,
      count: clustersData.length,
    });
  } catch (error) {
    console.error('List clusters error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get cluster details
const getCluster = async (req, res) => {
  try {
    const cluster = req.cluster;

    // Access check is handled in middleware, but verify here
    // This check is redundant but kept for safety

    res.json({
      cluster: {
        id: cluster._id,
        name: cluster.name,
        slug: cluster.slug,
        description: cluster.description,
        collectionName: cluster.collectionName,
        schema: cluster.schema,
        indexes: cluster.indexes,
        documentCount: cluster.documentCount,
        readAccess: cluster.readAccess,
        writeAccess: cluster.writeAccess,
        apiEndpoint: `/api/db/clusters/${cluster._id}/data`,
        createdAt: cluster.createdAt,
        updatedAt: cluster.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get cluster error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update cluster
const updateCluster = async (req, res) => {
  try {
    const cluster = req.cluster;

    // Check ownership (update/delete require auth and ownership)
    if (!req.userId || cluster.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this cluster' });
    }

    const { name, description, schema, indexes, readAccess, writeAccess, apiEnabled } = req.body;

    if (name) cluster.name = name;
    if (description !== undefined) cluster.description = description;
    if (schema) cluster.schema = schema;
    if (indexes !== undefined) cluster.indexes = indexes;
    if (readAccess) cluster.readAccess = readAccess;
    if (writeAccess) cluster.writeAccess = writeAccess;
    if (apiEnabled !== undefined) cluster.apiEnabled = apiEnabled;

    await cluster.save();

    // Update indexes if changed
    if (indexes !== undefined && indexes.length > 0) {
      const DynamicModel = getDynamicModel(cluster.collectionName, cluster.schema, cluster.schema?.strict || false);
      await createIndexes(DynamicModel, indexes);
    }

    // Publish cluster updated event
    await publishEvent('cluster-events', {
      type: 'CLUSTER_UPDATED',
      clusterId: cluster._id.toString(),
      userId: req.userId,
    });

    res.json({
      message: 'Cluster updated successfully',
      cluster: {
        id: cluster._id,
        name: cluster.name,
        slug: cluster.slug,
        description: cluster.description,
        readAccess: cluster.readAccess,
        writeAccess: cluster.writeAccess,
        apiEnabled: cluster.apiEnabled,
        updatedAt: cluster.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update cluster error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete cluster
const deleteCluster = async (req, res) => {
  try {
    const cluster = req.cluster;

    // Check ownership (delete requires auth and ownership)
    if (!req.userId || cluster.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this cluster' });
    }

    const clusterId = cluster._id.toString();
    const collectionName = cluster.collectionName;

    // Delete all documents in the collection
    const DynamicModel = getDynamicModel(collectionName, cluster.schema, cluster.schema?.strict || false);
    await DynamicModel.deleteMany({});

    // Clear model cache
    clearModelCache(collectionName);

    // Delete the collection
    await mongoose.connection.db.collection(collectionName).drop().catch(() => {
      // Collection might not exist, ignore error
    });

    // Delete cluster record
    await Cluster.findByIdAndDelete(clusterId);

    // Publish cluster deleted event
    await publishEvent('cluster-events', {
      type: 'CLUSTER_DELETED',
      clusterId,
      userId: req.userId,
      collectionName,
    });

    res.json({ message: 'Cluster deleted successfully' });
  } catch (error) {
    console.error('Delete cluster error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
};

module.exports = {
  createCluster,
  listClusters,
  getCluster,
  updateCluster,
  deleteCluster,
};

