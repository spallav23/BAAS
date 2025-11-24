const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clusterController = require('../controllers/clusterController');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/auth');
const optionalAuthMiddleware = require('../middleware/optionalAuth');
const checkClusterAccess = require('../middleware/clusterAccess');
const validate = require('../middleware/validation');

const createClusterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('schema').optional().isObject(),
  body('indexes').optional().isArray(),
  body('readAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('writeAccess').optional().isIn(['public', 'private', 'authenticated']),
];

const updateClusterValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('schema').optional().isObject(),
  body('indexes').optional().isArray(),
  body('readAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('writeAccess').optional().isIn(['public', 'private', 'authenticated']),
  body('apiEnabled').optional().isBoolean(),
];

// Cluster routes - require auth for creation/listing
router.post('/clusters', authMiddleware, createClusterValidation, validate, clusterController.createCluster);
router.get('/clusters', authMiddleware, clusterController.listClusters);

// Cluster detail and data routes - use optional auth (allows public access)
router.get('/clusters/:clusterId', optionalAuthMiddleware, checkClusterAccess, clusterController.getCluster);
router.put('/clusters/:clusterId', authMiddleware, checkClusterAccess, updateClusterValidation, validate, clusterController.updateCluster);
router.delete('/clusters/:clusterId', authMiddleware, checkClusterAccess, clusterController.deleteCluster);

// Data routes - use optional auth (allows public access)
router.post('/clusters/:clusterId/data', optionalAuthMiddleware, checkClusterAccess, dataController.createDocument);
router.get('/clusters/:clusterId/data', optionalAuthMiddleware, checkClusterAccess, dataController.listDocuments);
router.get('/clusters/:clusterId/data/:documentId', optionalAuthMiddleware, checkClusterAccess, dataController.getDocument);
router.put('/clusters/:clusterId/data/:documentId', optionalAuthMiddleware, checkClusterAccess, dataController.updateDocument);
router.patch('/clusters/:clusterId/data/:documentId', optionalAuthMiddleware, checkClusterAccess, dataController.patchDocument);
router.delete('/clusters/:clusterId/data/:documentId', optionalAuthMiddleware, checkClusterAccess, dataController.deleteDocument);
router.delete('/clusters/:clusterId/data', optionalAuthMiddleware, checkClusterAccess, dataController.deleteDocuments);

module.exports = router;

