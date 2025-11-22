const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const clusterController = require('../controllers/clusterController');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/auth');
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

router.use(authMiddleware);
router.post('/clusters', createClusterValidation, validate, clusterController.createCluster);
router.get('/clusters', clusterController.listClusters);
router.get('/clusters/:clusterId', checkClusterAccess, clusterController.getCluster);
router.put('/clusters/:clusterId', checkClusterAccess, updateClusterValidation, validate, clusterController.updateCluster);
router.delete('/clusters/:clusterId', checkClusterAccess, clusterController.deleteCluster);

router.post('/clusters/:clusterId/data', checkClusterAccess, dataController.createDocument);
router.get('/clusters/:clusterId/data', checkClusterAccess, dataController.listDocuments);
router.get('/clusters/:clusterId/data/:documentId', checkClusterAccess, dataController.getDocument);
router.put('/clusters/:clusterId/data/:documentId', checkClusterAccess, dataController.updateDocument);
router.patch('/clusters/:clusterId/data/:documentId', checkClusterAccess, dataController.patchDocument);
router.delete('/clusters/:clusterId/data/:documentId', checkClusterAccess, dataController.deleteDocument);
router.delete('/clusters/:clusterId/data', checkClusterAccess, dataController.deleteDocuments);

module.exports = router;

