const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    validate([
      body('title').trim().notEmpty().withMessage('Task title is required'),
      body('project').isMongoId().withMessage('Valid Project ID is required')
    ]),
    taskController.createTask
  )
  .get(taskController.getAllTasks);

router
  .route('/:id')
  .get(
    validate([param('id').isMongoId().withMessage('Invalid Task ID')]),
    taskController.getTaskById
  )
  .patch(
    validate([param('id').isMongoId().withMessage('Invalid Task ID')]),
    taskController.updateTask
  )
  .delete(
    validate([param('id').isMongoId().withMessage('Invalid Task ID')]),
    taskController.deleteTask
  );

router.post(
  '/:id/comments',
  validate([
    param('id').isMongoId().withMessage('Invalid Task ID'),
    body('text').trim().notEmpty().withMessage('Comment text cannot be empty')
  ]),
  taskController.addComment
);

router.post(
  '/:id/subtasks',
  validate([
    param('id').isMongoId().withMessage('Invalid Task ID'),
    body('title').trim().notEmpty().withMessage('Subtask title cannot be empty')
  ]),
  taskController.addSubtask
);

router.patch(
  '/:id/subtasks/:subtaskId',
  validate([
    param('id').isMongoId().withMessage('Invalid Task ID'),
    param('subtaskId').isMongoId().withMessage('Invalid Subtask ID')
  ]),
  taskController.updateSubtask
);

module.exports = router;

