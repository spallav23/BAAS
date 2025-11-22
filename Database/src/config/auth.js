const axios = require('axios');

const verifyToken = async (token) => {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const response = await axios.get(`${authServiceUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.user;
  } catch (error) {
    if (error.response) {
      throw new Error('Invalid or expired token');
    }
    throw new Error('Auth service unavailable');
  }
};

module.exports = { verifyToken };

