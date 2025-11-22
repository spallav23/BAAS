const { verifyToken } = require('../config/auth');

// Optional auth middleware - sets user if token is provided, but doesn't fail if no token
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      try {
        const user = await verifyToken(token);
        if (user) {
          // Handle both _id (Mongoose) and id (virtual) fields
          req.userId = user._id ? user._id.toString() : (user.id ? user.id.toString() : null);
          req.user = user;
        }
      } catch (error) {
        // If token is invalid, continue without user (for public access)
        console.warn('Optional auth: Invalid token, continuing without authentication');
      }
    }

    next();
  } catch (error) {
    // Always continue, even on error (for public access)
    next();
  }
};

module.exports = optionalAuthMiddleware;

