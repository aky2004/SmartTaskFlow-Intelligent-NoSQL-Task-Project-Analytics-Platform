const Task = require('../models/Task');
const { calculateOverdueRisk } = require('../services/riskScoreService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    project,
    assignee,
    subtasks,
    status,
    priority,
    dueDate,
    tags
  } = req.body;

  const initialTaskData = {
    title,
    description,
    project,
    assignee: assignee || null,
    createdBy: req.user._id,
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    comments: [],
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: dueDate ? new Date(dueDate) : null,
    tags: Array.isArray(tags) ? tags : [],
    activityLog: [
      {
        action: 'task_created',
        performedBy: req.user._id,
        newValue: { status: status || 'todo', priority: priority || 'medium' },
        timestamp: new Date()
      }
    ]
  };

  // Calculate intelligent overdue risk score on creation
  initialTaskData.overdueRiskScore = calculateOverdueRisk(initialTaskData);

  const task = await Task.create(initialTaskData);
  await task.populate([
    { path: 'project', select: 'name status' },
    { path: 'assignee', select: 'name email' },
    { path: 'createdBy', select: 'name email' }
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const { project, status, assignee, priority, search, isArchived, sort } = req.query;
  const filter = {};

  if (isArchived === 'true') {
    filter.isArchived = true;
  } else if (isArchived === 'all') {
    // Return both
  } else {
    filter.isArchived = false;
  }

  if (project) filter.project = project;
  if (status) filter.status = status;
  if (assignee) filter.assignee = assignee;
  if (priority) filter.priority = priority;

  // Text search on title/description if provided
  if (search) {
    filter.$text = { $search: search };
  }

  let query = Task.find(filter)
    .populate('project', 'name status')
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email');

  // Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ overdueRiskScore: -1, dueDate: 1, createdAt: -1 });
  }

  const tasks = await query;

  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks
    }
  });
});

exports.getTaskById = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('project', 'name status owner')
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.author', 'name email')
    .populate('activityLog.performedBy', 'name email');

  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  const {
    title,
    description,
    assignee,
    status,
    priority,
    dueDate,
    tags,
    isArchived
  } = req.body;

  // Track activity logs for significant field changes
  if (status && status !== task.status) {
    task.activityLog.push({
      action: 'status_changed',
      performedBy: req.user._id,
      oldValue: task.status,
      newValue: status,
      timestamp: new Date()
    });
    task.status = status;
  }

  if (priority && priority !== task.priority) {
    task.activityLog.push({
      action: 'priority_changed',
      performedBy: req.user._id,
      oldValue: task.priority,
      newValue: priority,
      timestamp: new Date()
    });
    task.priority = priority;
  }

  if (assignee !== undefined && String(assignee) !== String(task.assignee)) {
    task.activityLog.push({
      action: 'assignee_changed',
      performedBy: req.user._id,
      oldValue: task.assignee,
      newValue: assignee,
      timestamp: new Date()
    });
    task.assignee = assignee;
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
  if (tags !== undefined) task.tags = tags;
  if (isArchived !== undefined) task.isArchived = isArchived;

  // Recalculate intelligent risk score on update
  task.overdueRiskScore = calculateOverdueRisk(task);

  await task.save();
  await task.populate([
    { path: 'project', select: 'name status' },
    { path: 'assignee', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
    { path: 'comments.author', select: 'name email' },
    { path: 'activityLog.performedBy', select: 'name email' }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      task
    }
  });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { hard } = req.query;

  if (hard === 'true') {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }
  } else {
    // Soft delete (sets isArchived to true for TTL index demo)
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isArchived: true, updatedAt: new Date() },
      { new: true }
    );
    if (!task) {
      return next(new AppError('No task found with that ID', 404));
    }
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return next(new AppError('Comment text is required', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  const newComment = {
    text: text.trim(),
    author: req.user._id,
    createdAt: new Date()
  };

  task.comments.push(newComment);
  task.activityLog.push({
    action: 'comment_added',
    performedBy: req.user._id,
    newValue: text.trim().substring(0, 50),
    timestamp: new Date()
  });

  await task.save();
  await task.populate('comments.author', 'name email');

  res.status(201).json({
    status: 'success',
    data: {
      comments: task.comments
    }
  });
});

exports.addSubtask = catchAsync(async (req, res, next) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return next(new AppError('Subtask title is required', 400));
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  task.subtasks.push({
    title: title.trim(),
    completed: false
  });

  task.activityLog.push({
    action: 'subtask_added',
    performedBy: req.user._id,
    newValue: title.trim(),
    timestamp: new Date()
  });

  // Re-evaluate risk score after subtask addition
  task.overdueRiskScore = calculateOverdueRisk(task);

  await task.save();

  res.status(201).json({
    status: 'success',
    data: {
      subtasks: task.subtasks,
      overdueRiskScore: task.overdueRiskScore
    }
  });
});

exports.updateSubtask = catchAsync(async (req, res, next) => {
  const { completed, title } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) {
    return next(new AppError('No task found with that ID', 404));
  }

  const subtask = task.subtasks.id(req.params.subtaskId);
  if (!subtask) {
    return next(new AppError('No subtask found with that ID', 404));
  }

  if (completed !== undefined) {
    subtask.completed = completed;
    subtask.completedAt = completed ? new Date() : null;
  }
  if (title !== undefined) {
    subtask.title = title.trim();
  }

  task.activityLog.push({
    action: 'subtask_updated',
    performedBy: req.user._id,
    newValue: { subtaskId: req.params.subtaskId, completed: subtask.completed },
    timestamp: new Date()
  });

  task.overdueRiskScore = calculateOverdueRisk(task);
  await task.save();

  res.status(200).json({
    status: 'success',
    data: {
      subtask,
      overdueRiskScore: task.overdueRiskScore
    }
  });
});

