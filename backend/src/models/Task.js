const mongoose = require('mongoose');
const { Schema } = mongoose;

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  },
  { _id: true }
);

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const activityLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true // e.g., "task_created", "status_changed", "assigned", "comment_added", "subtask_added"
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    oldValue: {
      type: Schema.Types.Mixed
    },
    newValue: {
      type: Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // Referencing
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
      index: true
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required']
    },

    // Embedded documents (1:Many inside task)
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    activityLog: [activityLogSchema],

    // Core fields with validation
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'review', 'done', 'cancelled'],
        message: '{VALUE} is not a valid status'
      },
      default: 'todo',
      index: true
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'medium',
      index: true
    },
    dueDate: {
      type: Date,
      index: true
    },
    completedAt: {
      type: Date
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // Intelligent field (0-100 score)
    overdueRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    isArchived: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false // We manually manage createdAt and updatedAt
  }
);

// Pre-save middleware to update updatedAt timestamp
taskSchema.pre('save', function () {
  this.updatedAt = new Date();
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
