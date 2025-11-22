const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bucketController = require('../controllers/bucketController');
const fileController = require('../controllers/fileController');
const authMiddleware = require('../middleware/auth');
const optionalAuthMiddleware = require('../middleware/optionalAuth');
const checkBucketAccess = require('../middleware/bucketAccess');
const { upload, checkFileSize } = require('../middleware/upload');
const validate = require('../middleware/validation');

const createBucketValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('allowedFileTypes').optional().isArray(),
  body('maxFileSize').optional().isInt({ min: 0 }),
  body('readAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('writeAccess').optional().isIn(['public', 'private', 'authenticated']),
];

const updateBucketValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('allowedFileTypes').optional().isArray(),
  body('maxFileSize').optional().isInt({ min: 0 }),
  body('readAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('writeAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('apiEnabled').optional().isBoolean(),
];

router.use(authMiddleware);

// Bucket routes
router.post('/buckets', createBucketValidation, validate, bucketController.createBucket);
router.get('/buckets', bucketController.listBuckets);
router.get('/buckets/:bucketId', checkBucketAccess, bucketController.getBucket);
router.put('/buckets/:bucketId', checkBucketAccess, updateBucketValidation, validate, bucketController.updateBucket);
router.delete('/buckets/:bucketId', checkBucketAccess, bucketController.deleteBucket);

// File routes
router.post('/buckets/:bucketId/files', checkBucketAccess, checkFileSize, upload.single('file'), fileController.uploadFile);
router.get('/buckets/:bucketId/files', checkBucketAccess, fileController.listFiles);
router.get('/buckets/:bucketId/files/:fileId', checkBucketAccess, fileController.getFile);
router.get('/buckets/:bucketId/files/:fileName/download', checkBucketAccess, fileController.downloadFile);
router.delete('/buckets/:bucketId/files/:fileId', checkBucketAccess, fileController.deleteFile);

module.exports = router;

