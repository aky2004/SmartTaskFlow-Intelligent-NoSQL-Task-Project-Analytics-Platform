const mongoose = require('mongoose');
const Task = require('../models/Task');

/**
 * Pipeline 1: Overview of Tasks by Status and Priority
 * Demonstrates: $facet for multi-dimensional aggregation in a single query pass
 */
const getTasksOverview = async () => {
  const result = await Task.aggregate([
    { $match: { isArchived: false } },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        byPriority: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        matrix: [
          {
            $group: {
              _id: { status: '$status', priority: '$priority' },
              count: { $sum: 1 }
            }
          }
        ],
        metrics: [
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
              avgRiskScore: { $avg: '$overdueRiskScore' },
              completedTasks: {
                $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
              },
              overdueCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $ne: ['$status', 'done'] },
                        { $ne: ['$status', 'cancelled'] },
                        { $lt: ['$dueDate', new Date()] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]
      }
    }
  ]);

  return result[0];
};

/**
 * Pipeline 2: Overdue Tasks Report
 * Demonstrates: $match with date comparison, $lookup joins with foreign collections,
 * $project with computed dateDiff fields, and $sort
 */
const getOverdueTasks = async () => {
  const now = new Date();

  return await Task.aggregate([
    {
      $match: {
        isArchived: false,
        status: { $nin: ['done', 'cancelled'] },
        dueDate: { $lt: now }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails'
      }
    },
    {
      $unwind: {
        path: '$projectDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignee',
        foreignField: '_id',
        as: 'assigneeDetails'
      }
    },
    {
      $unwind: {
        path: '$assigneeDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        priority: 1,
        status: 1,
        dueDate: 1,
        overdueRiskScore: 1,
        projectName: { $ifNull: ['$projectDetails.name', 'Unassigned Project'] },
        assigneeName: { $ifNull: ['$assigneeDetails.name', 'Unassigned'] },
        daysOverdue: {
          $ceil: {
            $divide: [
              { $subtract: [now, '$dueDate'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      }
    },
    {
      $sort: { overdueRiskScore: -1, dueDate: 1 }
    }
  ]);
};

/**
 * Pipeline 3: User Workload
 * Demonstrates: $group by referencing field, conditional sums with $cond,
 * $lookup for user data, and dynamic workload level classification
 */
const getUserWorkload = async () => {
  return await Task.aggregate([
    {
      $match: {
        isArchived: false,
        status: { $nin: ['done', 'cancelled'] }
      }
    },
    {
      $group: {
        _id: '$assignee',
        totalOpenTasks: { $sum: 1 },
        criticalTasks: {
          $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
        },
        highTasks: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        mediumOrLowTasks: {
          $sum: {
            $cond: [
              { $in: ['$priority', ['medium', 'low']] },
              1,
              0
            ]
          }
        },
        rawAvgRiskScore: { $avg: '$overdueRiskScore' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        userId: '$_id',
        userName: { $ifNull: ['$user.name', 'Unassigned'] },
        userEmail: { $ifNull: ['$user.email', 'N/A'] },
        totalOpenTasks: 1,
        criticalTasks: 1,
        highTasks: 1,
        mediumOrLowTasks: 1,
        avgRiskScore: { $round: [{ $ifNull: ['$rawAvgRiskScore', 0] }, 1] },
        workloadLevel: {
          $switch: {
            branches: [
              { case: { $gte: ['$totalOpenTasks', 8] }, then: 'Overloaded' },
              { case: { $gte: ['$totalOpenTasks', 4] }, then: 'Moderate' }
            ],
            default: 'Optimal'
          }
        }
      }
    },
    {
      $sort: { totalOpenTasks: -1, criticalTasks: -1 }
    }
  ]);
};

/**
 * Pipeline 4: Project Progress and Velocity
 * Demonstrates: Single project aggregation, completion percentage calculation,
 * velocity over trailing time windows (7 & 30 days)
 */
const getProjectProgress = async (projectId) => {
  const objectId = new mongoose.Types.ObjectId(String(projectId));
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const results = await Task.aggregate([
    {
      $match: {
        project: objectId,
        isArchived: false
      }
    },
    {
      $group: {
        _id: '$project',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        reviewTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] }
        },
        todoTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] }
        },
        completedLast7Days: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'done'] },
                  { $gte: ['$completedAt', sevenDaysAgo] }
                ]
              },
              1,
              0
            ]
          }
        },
        completedLast30Days: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'done'] },
                  { $gte: ['$completedAt', thirtyDaysAgo] }
                ]
              },
              1,
              0
            ]
          }
        },
        rawAvgRiskScore: { $avg: '$overdueRiskScore' },
        criticalOpenTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'done'] },
                  { $eq: ['$priority', 'critical'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: '_id',
        foreignField: '_id',
        as: 'project'
      }
    },
    {
      $unwind: '$project'
    },
    {
      $project: {
        _id: 1,
        projectName: '$project.name',
        projectStatus: '$project.status',
        totalTasks: 1,
        completedTasks: 1,
        inProgressTasks: 1,
        reviewTasks: 1,
        todoTasks: 1,
        completionPercentage: {
          $cond: [
            { $eq: ['$totalTasks', 0] },
            0,
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100
                  ]
                },
                1
              ]
            }
          ]
        },
        velocityLast7Days: '$completedLast7Days',
        velocityLast30Days: '$completedLast30Days',
        avgRiskScore: { $round: [{ $ifNull: ['$rawAvgRiskScore', 0] }, 1] },
        criticalOpenTasks: 1
      }
    }
  ]);

  if (!results.length) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionPercentage: 0,
      velocityLast7Days: 0,
      velocityLast30Days: 0,
      avgRiskScore: 0,
      message: 'No tasks found for this project'
    };
  }

  return results[0];
};

/**
 * Pipeline 5: Riskiest Tasks
 * Demonstrates: High-risk predictive sorting, embedding size metrics (subtasks/comments count),
 * and project/assignee lookups
 */
const getRiskiestTasks = async (limit = 10) => {
  return await Task.aggregate([
    {
      $match: {
        isArchived: false,
        status: { $nin: ['done', 'cancelled'] }
      }
    },
    {
      $lookup: {
        from: 'projects',
        localField: 'project',
        foreignField: '_id',
        as: 'projectDetails'
      }
    },
    {
      $unwind: {
        path: '$projectDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignee',
        foreignField: '_id',
        as: 'assigneeDetails'
      }
    },
    {
      $unwind: {
        path: '$assigneeDetails',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        priority: 1,
        dueDate: 1,
        overdueRiskScore: 1,
        projectName: { $ifNull: ['$projectDetails.name', 'Unassigned Project'] },
        assigneeName: { $ifNull: ['$assigneeDetails.name', 'Unassigned'] },
        subtasksCount: { $size: { $ifNull: ['$subtasks', []] } },
        commentsCount: { $size: { $ifNull: ['$comments', []] } }
      }
    },
    {
      $sort: { overdueRiskScore: -1, dueDate: 1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = {
  getTasksOverview,
  getOverdueTasks,
  getUserWorkload,
  getProjectProgress,
  getRiskiestTasks
};
