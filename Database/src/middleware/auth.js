const { verifyToken } = require('../config/auth');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const user = await verifyToken(token);
    
    if (!user) {
      console.error('No user returned from auth service');
      return res.status(401).json({ error: 'Invalid user data from auth service' });
    }
    
    // Handle both _id (Mongoose) and id (virtual) fields
    req.userId = user._id ? user._id.toString() : (user.id ? user.id.toString() : null);
    
    if (!req.userId) {
      console.error('User object from auth service (missing ID):', JSON.stringify(user, null, 2));
      return res.status(401).json({ error: 'Invalid user data from auth service - missing user ID' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({ error: error.message });
    }
    if (error.message === 'Auth service unavailable') {
      return res.status(503).json({ error: 'Authentication service unavailable' });
    }
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;

