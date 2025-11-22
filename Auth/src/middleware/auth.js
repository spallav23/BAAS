const jwt = require('jsonwebtoken');
const { getRedisClient } = require('../config/redis');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    // Check if token is blacklisted in Redis
    const redisClient = getRedisClient();
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = await User.findById(decoded.userId).select('-password -verificationCodes -refreshTokens');
    
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;

