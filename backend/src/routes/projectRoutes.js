const express = require('express');
const { body, param } = require('express-validator');
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    validate([
      body('name').trim().notEmpty().withMessage('Project name is required')
    ]),
    projectController.createProject
  )
  .get(projectController.getAllProjects);

router
  .route('/:id')
  .get(
    validate([
      param('id').isMongoId().withMessage('Invalid Project ID')
    ]),
    projectController.getProjectById
  )
  .patch(
    validate([
      param('id').isMongoId().withMessage('Invalid Project ID')
    ]),
    projectController.updateProject
  )
  .delete(
    validate([
      param('id').isMongoId().withMessage('Invalid Project ID')
    ]),
    projectController.deleteProject
  );

module.exports = router;

