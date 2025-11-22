const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { getRedisClient } = require('../config/redis');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const { publishEvent } = require('../config/kafka');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    // Generate email verification code
    const verificationCode = user.generateVerificationCode('email-verification');
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue even if email fails
    }

    // Publish user created event
    await publishEvent('user-events', {
      type: 'USER_CREATED',
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshTokenExpiry,
    });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Publish login event
    await publishEvent('auth-events', {
      type: 'USER_LOGIN',
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const { refreshToken } = req.body;

    if (token) {
      // Blacklist access token in Redis
      const redisClient = getRedisClient();
      const decoded = verifyToken(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      if (expiresIn > 0) {
        await redisClient.setEx(`blacklist:${token}`, expiresIn, 'true');
      }
    }

    if (refreshToken) {
      // Remove refresh token from user's tokens
      const user = await User.findById(req.userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (rt) => rt.token !== refreshToken
        );
        await user.save();
      }
    }

    // Publish logout event
    await publishEvent('auth-events', {
      type: 'USER_LOGOUT',
      userId: req.userId,
    });

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    res.status(500).json({ error: 'Server error during token refresh' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -verificationCodes -refreshTokens');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.id;

    // Check if user is updating their own profile or is admin
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If email is being changed, require verification
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      user.email = email;
      user.emailVerified = false;
      const verificationCode = user.generateVerificationCode('email-verification');
      try {
        await sendVerificationEmail(email, verificationCode);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    // Publish user updated event
    await publishEvent('user-events', {
      type: 'USER_UPDATED',
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error during update' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user is deleting their own account or is admin
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(userId);

    // Publish user deleted event
    await publishEvent('user-events', {
      type: 'USER_DELETED',
      userId: userId,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error during deletion' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists for security
      return res.json({ message: 'If user exists, password reset code has been sent' });
    }

    // Generate password reset code
    const resetCode = user.generateVerificationCode('password-reset');
    await user.save();

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetCode);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ error: 'Error sending password reset email' });
    }

    res.json({ message: 'Password reset code has been sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify reset code
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = user.verifyCode(code, 'email-verification');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    await user.save();

    res.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify code
    const isValid = user.verifyCode(code, 'password-reset');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    // Update password
    user.password = newPassword;
    user.cleanExpiredCodes();
    await user.save();

    // Publish password reset event
    await publishEvent('auth-events', {
      type: 'PASSWORD_RESET',
      userId: user._id.toString(),
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send verification email
const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verificationCode = user.generateVerificationCode('email-verification');
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      return res.status(500).json({ error: 'Error sending verification email' });
    }

    res.json({ message: 'Verification code has been sent to your email' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const isValid = user.verifyCode(code, 'email-verification');
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    user.cleanExpiredCodes();
    await user.save();

    // Publish email verified event
    await publishEvent('user-events', {
      type: 'EMAIL_VERIFIED',
      userId: user._id.toString(),
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateUser,
  deleteUser,
  forgotPassword,
  verifyCode,
  resetPassword,
  sendVerification,
  verifyEmail,
};

