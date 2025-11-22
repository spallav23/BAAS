const axios = require('axios');
const { log } = require('console');

const verifyToken = async (token) => {
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://127.0.0.1:3001";
    const response = await axios.get(`${authServiceUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.data || !response.data.user) {
      console.error('Invalid response from auth service:', response.data);
      throw new Error('Invalid response from auth service');
    }
    
    return response.data.user;
  } catch (error) {
    if (error.response) {
      console.error('Auth service error response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        throw new Error('Invalid or expired token');
      }
      throw new Error(`Auth service error: ${error.response.status}`);
    }
    if (error.request) {
      console.error('Auth service request failed:', error.message);
      throw new Error('Auth service unavailable');
    }
    throw error;
  }
};

module.exports = { verifyToken };

