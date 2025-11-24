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

    // Check access based on access level
    const isOwner = req.userId && cluster.userId === req.userId;
    const isReadOperation = req.method === 'GET';
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    // Owner has full access
    if (isOwner) {
      req.cluster = cluster;
      return next();
    }

    // Check read access
    if (isReadOperation) {
      if (cluster.readAccess === 'public') {
        // Public access - no auth required
        req.cluster = cluster;
        return next();
      } else if (cluster.readAccess === 'authenticated' && req.userId) {
        // Authenticated access - user must be logged in
        req.cluster = cluster;
        return next();
      } else if (cluster.readAccess === 'private') {
        // Private access - only owner
        return res.status(403).json({ error: 'Access denied to this cluster' });
      }
    }

    // Check write access
    if (isWriteOperation) {
      if (cluster.writeAccess === 'public') {
        // Public write access
        req.cluster = cluster;
        return next();
      } else if (cluster.writeAccess === 'authenticated' && req.userId) {
        // Authenticated write access
        req.cluster = cluster;
        return next();
      } else if (cluster.writeAccess === 'private') {
        // Private write access - only owner
        return res.status(403).json({ error: 'Write access denied' });
      }
    }

    // Default: deny access
    return res.status(403).json({ error: 'Access denied to this cluster' });
  } catch (error) {
    console.error('Cluster access check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkClusterAccess;

