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

    // Check if user owns the bucket
    if (bucket.userId !== req.userId) {
      // Check public access for read operations
      if (req.method === 'GET') {
        if (bucket.readAccess === 'private') {
          return res.status(403).json({ error: 'Access denied to this bucket' });
        }
      } else {
        // For write operations, check write access
        if (bucket.writeAccess === 'private' || bucket.userId !== req.userId) {
          return res.status(403).json({ error: 'Access denied to this bucket' });
        }
      }
    }

    // Attach bucket to request
    req.bucket = bucket;
    next();
  } catch (error) {
    console.error('Bucket access check error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = checkBucketAccess;

