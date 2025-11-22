const Cluster = require('../models/Cluster');

const checkClusterAccess = async (req, res, next) => {
  try {
    const { clusterId } = req.params;
    const cluster = await Cluster.findById(clusterId);

    if (!cluster) {
      return res.status(404).json({ error: 'Cluster not found' });
    }

    if (!cluster.isActive) {
      return res.status(403).json({ error: 'Cluster is inactive' });
    }

    // Check if user owns the cluster
    if (cluster.userId !== req.userId) {
      // Check public access for read operations
      if (req.method === 'GET') {
        if (cluster.readAccess === 'private') {
          return res.status(403).json({ error: 'Access denied to this cluster' });
        }
      } else {
        // For write operations, check write access
        if (cluster.writeAccess === 'private' || cluster.userId !== req.userId) {
          return res.status(403).json({ error: 'Access denied to this cluster' });
        }
      }
    }

    // Attach cluster to request
    req.cluster = cluster;
    next();
  } catch (error) {
    console.error('Cluster access check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkClusterAccess;

