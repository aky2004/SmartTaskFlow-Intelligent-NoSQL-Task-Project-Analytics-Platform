# SmartTaskFlow – Aggregation Pipelines In-Depth Reference

The MongoDB Aggregation Framework processes documents through an ordered multi-stage data processing pipeline. SmartTaskFlow leverages 5 core aggregation pipelines in `src/services/aggregationService.js`.

---

## Pipeline 1: Tasks Overview by Status & Priority (`/api/analytics/overview`)

### Architectural Significance: `$facet`
Executes multiple independent analytical aggregations in parallel across the collection within a single database query.

### Stages:
1. **`$match`**: Filters out soft-deleted/archived tasks (`{ isArchived: false }`).
2. **`$facet`**: Splits execution into 4 concurrent sub-pipelines:
   - **`byStatus`**: Groups by `$status` and counts occurrences.
   - **`byPriority`**: Groups by `$priority` and counts occurrences.
   - **`matrix`**: Computes a two-dimensional cross-tabulation of `{ status, priority }`.
   - **`metrics`**: Calculates global KPIs including total tasks, average risk score, total completed, and overdue task count using `$cond`.

---

## Pipeline 2: Overdue Tasks Report (`/api/analytics/overdue`)

### Stages:
1. **`$match`**: Filters tasks where `isArchived: false`, `status: { $nin: ['done', 'cancelled'] }`, and `dueDate: { $lt: now }`.
2. **`$lookup` (Projects)**: Performs a left outer join to `projects` matching `project` ObjectId with `_id`.
3. **`$unwind`**: Flattens the single-element project array while preserving unassigned items.
4. **`$lookup` (Users)**: Joins assignee ObjectId with `users` collection.
5. **`$unwind`**: Flattens assignee details.
6. **`$project`**: Computes overdue duration:
   ```javascript
   daysOverdue: {
     $ceil: {
       $divide: [
         { $subtract: [now, '$dueDate'] },
         1000 * 60 * 60 * 24
       ]
     }
   }
   ```
7. **`$sort`**: Orders by `overdueRiskScore: -1` and `dueDate: 1`.

---

## Pipeline 3: User Workload & Capacity (`/api/analytics/workload`)

### Stages:
1. **`$match`**: Filters active, non-archived, open tasks.
2. **`$group`**: Groups by `$assignee` and calculates:
   - Total open tasks count: `$sum: 1`.
   - Critical tasks count using conditional summation:
     `$sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }`.
   - High tasks count.
   - Raw average risk score: `$avg: '$overdueRiskScore'`.
3. **`$lookup`**: Joins with `users` collection.
4. **`$unwind`**: Unwinds user object (`preserveNullAndEmptyArrays: true`).
5. **`$project`**: Applies `$round` to average risk score and evaluates team member workload severity with `$switch`:
   ```javascript
   workloadLevel: {
     $switch: {
       branches: [
         { case: { $gte: ['$totalOpenTasks', 8] }, then: 'Overloaded' },
         { case: { $gte: ['$totalOpenTasks', 4] }, then: 'Moderate' }
       ],
       default: 'Optimal'
     }
   }
   ```
6. **`$sort`**: Sorts by `totalOpenTasks: -1`.

---

## Pipeline 4: Project Progress & Velocity (`/api/analytics/project/:id/progress`)

### Stages:
1. **`$match`**: Filters tasks for the specified `project` ObjectId.
2. **`$group`**: Computes:
   - Total tasks.
   - Completed, in-progress, review, and todo task counts.
   - 7-Day Velocity:
     `$sum: { $cond: [{ $and: [{ $eq: ['$status', 'done'] }, { $gte: ['$completedAt', 7DaysAgo] }] }, 1, 0] }`.
   - 30-Day Velocity:
     `$sum: { $cond: [{ $and: [{ $eq: ['$status', 'done'] }, { $gte: ['$completedAt', 30DaysAgo] }] }, 1, 0] }`.
3. **`$lookup`**: Joins project metadata from `projects`.
4. **`$project`**: Calculates completion percentage mathematically:
   $$\text{completionPercentage} = \operatorname{round}\left(\frac{\text{completedTasks}}{\text{totalTasks}} \times 100, 1\right)$$

---

## Pipeline 5: Riskiest Tasks (`/api/analytics/riskiest`)

### Stages:
1. **`$match`**: Filters active open tasks.
2. **`$lookup`**: Joins project and assignee details.
3. **`$project`**: Includes array size metrics using the `$size` operator on embedded arrays:
   - `subtasksCount: { $size: { $ifNull: ['$subtasks', []] } }`
   - `commentsCount: { $size: { $ifNull: ['$comments', []] } }`
4. **`$sort`**: Orders by `overdueRiskScore: -1` and `dueDate: 1`.
5. **`$limit`**: Returns top $N$ high-risk tasks.

