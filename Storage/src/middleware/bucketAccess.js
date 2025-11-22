const Bucket = require('../models/Bucket');

const checkBucketAccess = async (req, res, next) => {
  try {
    const { bucketId } = req.params;
    const bucket = await Bucket.findById(bucketId);

    if (!bucket) {
      return res.status(404).json({ error: 'Bucket not found' });
    }

    if (!bucket.isActive) {
      return res.status(403).json({ error: 'Bucket is inactive' });
    }

    // Check access based on access level
    const isOwner = req.userId && bucket.userId === req.userId;
    const isReadOperation = req.method === 'GET';
    const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    // Owner has full access
    if (isOwner) {
      req.bucket = bucket;
      return next();
    }

    // Check read access
    if (isReadOperation) {
      if (bucket.readAccess === 'public') {
        // Public access - no auth required
        req.bucket = bucket;
        return next();
      } else if (bucket.readAccess === 'authenticated' && req.userId) {
        // Authenticated access - user must be logged in
        req.bucket = bucket;
        return next();
      } else if (bucket.readAccess === 'private') {
        // Private access - only owner
        return res.status(403).json({ error: 'Access denied to this bucket' });
      }
    }

    // Check write access
    if (isWriteOperation) {
      if (bucket.writeAccess === 'public') {
        // Public write access
        req.bucket = bucket;
        return next();
      } else if (bucket.writeAccess === 'authenticated' && req.userId) {
        // Authenticated write access
        req.bucket = bucket;
        return next();
      } else if (bucket.writeAccess === 'private') {
        // Private write access - only owner
        return res.status(403).json({ error: 'Write access denied' });
      }
    }

    // Default: deny access
    return res.status(403).json({ error: 'Access denied to this bucket' });
  } catch (error) {
    console.error('Bucket access check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkBucketAccess;

