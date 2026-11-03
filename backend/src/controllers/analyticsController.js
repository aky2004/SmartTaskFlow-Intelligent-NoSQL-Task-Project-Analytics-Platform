const aggregationService = require('../services/aggregationService');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const data = await aggregationService.getTasksOverview();
  res.status(200).json({
    status: 'success',
    data
  });
});

exports.getOverdueReport = catchAsync(async (req, res, next) => {
  const tasks = await aggregationService.getOverdueTasks();
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks
    }
  });
});

exports.getUserWorkload = catchAsync(async (req, res, next) => {
  const workload = await aggregationService.getUserWorkload();
  res.status(200).json({
    status: 'success',
    results: workload.length,
    data: {
      workload
    }
  });
});

exports.getProjectProgress = catchAsync(async (req, res, next) => {
  const progress = await aggregationService.getProjectProgress(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      progress
    }
  });
});

exports.getRiskiestTasks = catchAsync(async (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
  const tasks = await aggregationService.getRiskiestTasks(limit);
  res.status(200).json({
    status: 'success',
    results: tasks.length,
    data: {
      tasks
    }
  });
});

