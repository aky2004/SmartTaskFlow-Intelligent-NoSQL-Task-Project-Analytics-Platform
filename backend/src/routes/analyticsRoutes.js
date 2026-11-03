const express = require('express');
const { param } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/overview', analyticsController.getOverview);
router.get('/overdue', analyticsController.getOverdueReport);
router.get('/workload', analyticsController.getUserWorkload);
router.get(
  '/project/:id/progress',
  validate([param('id').isMongoId().withMessage('Invalid Project ID')]),
  analyticsController.getProjectProgress
);
router.get('/riskiest', analyticsController.getRiskiestTasks);

module.exports = router;

