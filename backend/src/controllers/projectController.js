const Project = require('../models/Project');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createProject = catchAsync(async (req, res, next) => {
  const { name, description, members, status, startDate, endDate } = req.body;

  const projectMembers = Array.isArray(members) ? members : [];
  if (!projectMembers.includes(req.user.id)) {
    projectMembers.push(req.user.id);
  }

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: projectMembers,
    status: status || 'active',
    startDate,
    endDate
  });

  await project.populate('owner members', 'name email');

  res.status(201).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const projects = await Project.find(filter)
    .populate('owner', 'name email role')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: projects.length,
    data: {
      projects
    }
  });
});

exports.getProjectById = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email role')
    .populate('members', 'name email');

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const allowedUpdates = ['name', 'description', 'status', 'members', 'startDate', 'endDate'];
  const updateData = {};

  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  }).populate('owner members', 'name email');

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      project
    }
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

