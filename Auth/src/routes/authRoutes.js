const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validation');

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const updateUserValidation = [
  body('name').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
];

const verifyCodeValidation = [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
];

const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 6 }),
];

const verifyEmailValidation = [
  body('code').isLength({ min: 6, max: 6 }).isNumeric(),
];

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/verify-code', verifyCodeValidation, validate, authController.verifyCode);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.put('/user/:id', updateUserValidation, validate, authController.updateUser);
router.delete('/user/:id', authController.deleteUser);
router.post('/send-verification', authController.sendVerification);
router.post('/verify-email', verifyEmailValidation, validate, authController.verifyEmail);

module.exports = router;

