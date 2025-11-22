const { verifyToken } = require('../config/auth');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const user = await verifyToken(token);
    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
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

