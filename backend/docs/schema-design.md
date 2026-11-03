# SmartTaskFlow – Schema Design & Data Modeling Analysis

## 1. Architectural Philosophy: The NoSQL Paradigm

In relational databases (RDBMS), data is normalized into tabular relations linked strictly by foreign keys. In MongoDB and document databases, the schema design is governed by **access patterns** and **cardinality relationships**:

> *"Data that is accessed together should be stored together, while shared and unbounded entities should be referenced."*

SmartTaskFlow models a multi-project task and project management ecosystem. Below is the comprehensive architectural breakdown of our modeling decisions.

---

## 2. Embedding vs. Referencing Decision Matrix

| Entity | Storage Strategy | Target Location | Cardinality | Rationale & Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Subtasks** | **Embedded** | `Task.subtasks` | $1 : N$ (bounded, typically 1–20) | Subtasks have no independent meaning outside of their parent task. When a task is viewed, its checklist must load immediately. Embedding eliminates costly multi-collection `$lookup` joins. |
| **Comments** | **Embedded** | `Task.comments` | $1 : N$ (bounded, typically 1–100) | Comments belong strictly to a single task conversation thread. Storing them inside the task document preserves atomic updates and enables instant retrieval on task inspection. |
| **Activity Log** | **Embedded** | `Task.activityLog` | $1 : N$ (bounded audit trail) | Change history is audited directly at the task level. Atomic `$push` operations guarantee audit compliance without multi-document distributed transaction overhead. |
| **Tags** | **Embedded** | `Task.tags` (Array of Strings) | $1 : N$ (multikey) | Simple array of categorical labels. Perfect for MongoDB multikey indexing (`{ tags: 1 }`), enabling high-speed tag filtering. |
| **User (Assignee/Creator/Owner)** | **Referenced** | `User` collection (`ObjectId`) | $N : 1$ / $M : N$ | Users exist independently across the entire organization, are assigned to dozens of projects and tasks, and authenticate via credentials. Duplicating user profiles inside each task would lead to massive write anomalies upon profile updates. |
| **Project** | **Referenced** | `Project` collection (`ObjectId`) | $1 : N$ | Projects represent macroscopic management boundaries containing many tasks, independent deadlines, and team rosters. Tasks reference their parent `project` via an indexed `ObjectId`. |

---

## 3. Detailed Schema Definitions

### 3.1 User Schema (`User.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
}
```
- **Integrity**: Unique index on `email` prevents race-condition registration collisions.
- **Security**: Pre-save hook computes high-entropy Bcrypt hashes ($12$ salt rounds). Password field defaults to `select: false` to avoid leaking hashes in API responses.

### 3.2 Project Schema (`Project.js`)
```javascript
{
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active', index: true },
  startDate: Date,
  endDate: Date,
  createdAt: { type: Date, default: Date.now }
}
```

### 3.3 Task Schema (`Task.js` – Core Hybrid Model)
```javascript
{
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },

  // Referencing Entities
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // Embedded Subdocuments
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],

  comments: [{
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  }],

  activityLog: [{
    action: { type: String, required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],

  // Core Attributes with Validation
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'review', 'done', 'cancelled'],
    default: 'todo',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  dueDate: { type: Date, index: true },
  completedAt: Date,
  tags: [{ type: String, trim: true }],

  // Intelligent Predictive Metric
  overdueRiskScore: { type: Number, min: 0, max: 100, default: 0 },

  // Soft Deletion & TTL Retention
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 4. Preventing Document Growth & BSON 16MB Threshold

MongoDB enforces a strict 16MB BSON document size limit. The subtasks, comments, and activity log within any individual task will never exceed 150KB under normal operation:
- 100 comments $\times \approx 300\text{ bytes} \approx 30\text{ KB}$.
- 50 subtasks $\times \approx 100\text{ bytes} \approx 5\text{ KB}$.
- Activity logs are lightweight event descriptors.

Thus, embedding provides optimal single-read efficiency while comfortably staying orders of magnitude below MongoDB's document boundary.

