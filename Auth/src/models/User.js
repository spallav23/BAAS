const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const verificationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['email-verification', 'password-reset'],
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    verificationCodes: [verificationCodeSchema],
    lastLogin: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification code
userSchema.methods.generateVerificationCode = function (type = 'email-verification') {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  this.verificationCodes.push({
    code,
    expiresAt,
    type,
    used: false,
  });

  return code;
};

// Method to verify code
userSchema.methods.verifyCode = function (code, type) {
  const verification = this.verificationCodes.find(
    (vc) => vc.code === code.toString() && vc.type === type && !vc.used && vc.expiresAt > new Date()
  );
  if (verification) {
    verification.used = true;
    this.emailVerified = true;
    return true;
  }
  return false;
};

// Method to clean expired codes
userSchema.methods.cleanExpiredCodes = function () {
  this.verificationCodes = this.verificationCodes.filter(
    (vc) => vc.expiresAt > new Date() && !vc.used
  );
};

module.exports = mongoose.model('User', userSchema);

