const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { calculateOverdueRisk } = require('../services/riskScoreService');

const seedData = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});

    console.log('[Seed] Creating Users...');
    const users = await User.create([
      {
        name: 'Alice Chen',
        email: 'alice@smarttaskflow.io',
        password: 'Password123!',
        role: 'admin'
      },
      {
        name: 'Bob Smith',
        email: 'bob@smarttaskflow.io',
        password: 'Password123!',
        role: 'user'
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@smarttaskflow.io',
        password: 'Password123!',
        role: 'user'
      },
      {
        name: 'Diana Prince',
        email: 'diana@smarttaskflow.io',
        password: 'Password123!',
        role: 'user'
      }
    ]);

    const [alice, bob, charlie, diana] = users;
    console.log(`[Seed] Created ${users.length} users.`);

    console.log('[Seed] Creating Projects...');
    const projects = await Project.create([
      {
        name: 'Cloud Infrastructure & NoSQL Modernization',
        description: 'Migrating legacy relational tables to scalable MongoDB clusters with compound indexing and aggregation.',
        owner: alice._id,
        members: [alice._id, bob._id, diana._id],
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Real-Time Enterprise Analytics Dashboard',
        description: 'Next-generation analytics frontend consuming MongoDB aggregation pipelines with live charts.',
        owner: bob._id,
        members: [bob._id, charlie._id],
        status: 'active',
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'AI Risk Predictor & Machine Learning Pipeline',
        description: 'Intelligent heuristic and scoring model predicting project deadline bottlenecks and overdue risks.',
        owner: alice._id,
        members: [alice._id, charlie._id, diana._id],
        status: 'active',
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ]);

    const [proj1, proj2, proj3] = projects;
    console.log(`[Seed] Created ${projects.length} projects.`);

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    console.log('[Seed] Creating Tasks with embedded subtasks, comments, and activity logs...');

    const taskTemplates = [
      // Project 1 Tasks
      {
        title: 'Design MongoDB Sharding and Replica Set Topology',
        description: 'Architect a 3-node replica set with shard keys optimized for high-volume task telemetry.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(now - 2 * day), // Overdue!
        createdAt: new Date(now - 14 * day),
        tags: ['infrastructure', 'mongodb', 'high-availability'],
        subtasks: [
          { title: 'Provision primary and secondary nodes', completed: true, completedAt: new Date(now - 8 * day) },
          { title: 'Configure arbiter node', completed: true, completedAt: new Date(now - 6 * day) },
          { title: 'Benchmark cross-region replication lag', completed: false },
          { title: 'Implement automated failover test scenario', completed: false },
          { title: 'Set up TLS encryption in transit', completed: false },
          { title: 'Configure audit logging', completed: false }
        ],
        comments: [
          { text: 'Replication lag test stalled due to network latency in us-west.', author: diana._id, createdAt: new Date(now - 3 * day) },
          { text: 'Let me know if you need AWS VPC peering adjustments.', author: alice._id, createdAt: new Date(now - 2 * day) }
        ],
        activityLog: [
          { action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 14 * day) },
          { action: 'status_changed', performedBy: diana._id, oldValue: 'todo', newValue: 'in_progress', timestamp: new Date(now - 10 * day) }
        ]
      },
      {
        title: 'Implement Compound Indexes on Task Collection',
        description: 'Create compound indexes on project-status-dueDate and assignee-status to avoid COLLSCAN bottlenecks.',
        project: proj1._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 5 * day),
        completedAt: new Date(now - 4 * day),
        createdAt: new Date(now - 12 * day),
        tags: ['performance', 'indexes', 'mongodb'],
        subtasks: [
          { title: 'Analyze frequent query patterns', completed: true, completedAt: new Date(now - 10 * day) },
          { title: 'Draft index specifications', completed: true, completedAt: new Date(now - 8 * day) },
          { title: 'Run explain() analysis on 10k synthetic documents', completed: true, completedAt: new Date(now - 5 * day) }
        ],
        comments: [
          { text: 'Execution time dropped from 48ms down to 1ms in explain()!', author: bob._id, createdAt: new Date(now - 4 * day) }
        ],
        activityLog: [
          { action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 12 * day) },
          { action: 'status_changed', performedBy: bob._id, oldValue: 'in_progress', newValue: 'done', timestamp: new Date(now - 4 * day) }
        ]
      },
      {
        title: 'Migrate User Session Store to TTL Collection',
        description: 'Set up partial TTL index to auto-expire archived sessions and inactive user task tokens.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 10 * day),
        createdAt: new Date(now - 3 * day),
        tags: ['security', 'ttl', 'maintenance'],
        subtasks: [
          { title: 'Define TTL index criteria', completed: true, completedAt: new Date(now - 1 * day) },
          { title: 'Add partialFilterExpression for archived docs', completed: false }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 3 * day) }]
      },
      {
        title: 'Configure Disaster Recovery and Automated Daily Backups',
        description: 'Schedule mongodump snapshots to AWS S3 bucket with retention rotation policy.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'review',
        priority: 'high',
        dueDate: new Date(now + 1 * day), // Due soon
        createdAt: new Date(now - 8 * day),
        tags: ['devops', 'backup', 'dr'],
        subtasks: [
          { title: 'Write S3 backup shell script', completed: true, completedAt: new Date(now - 3 * day) },
          { title: 'Test restoration from snapshot in staging', completed: true, completedAt: new Date(now - 1 * day) },
          { title: 'Submit PR for security review', completed: false }
        ],
        comments: [
          { text: 'Restoration validated in under 3 minutes.', author: diana._id, createdAt: new Date(now - 1 * day) }
        ],
        activityLog: [
          { action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 8 * day) },
          { action: 'status_changed', performedBy: diana._id, oldValue: 'in_progress', newValue: 'review', timestamp: new Date(now - 1 * day) }
        ]
      },
      {
        title: 'Establish Schema Validation Rules for Task Status & Priority',
        description: 'Enforce JSON Schema validation directly at the MongoDB collection level using Mongoose enum checks.',
        project: proj1._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'done',
        priority: 'medium',
        dueDate: new Date(now - 15 * day),
        completedAt: new Date(now - 14 * day),
        createdAt: new Date(now - 20 * day),
        tags: ['validation', 'schema'],
        subtasks: [
          { title: 'Document acceptable status values', completed: true, completedAt: new Date(now - 18 * day) },
          { title: 'Implement Mongoose validators', completed: true, completedAt: new Date(now - 15 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 20 * day) }]
      },
      {
        title: 'Write Stress Test Suite for Concurrent MongoDB Writes',
        description: 'Simulate 200 concurrent users writing tasks and subtasks to test connection pool saturation.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(now - 1 * day), // Overdue!
        createdAt: new Date(now - 10 * day),
        tags: ['testing', 'performance', 'stress-test'],
        subtasks: [
          { title: 'Setup artillery test harness', completed: true, completedAt: new Date(now - 5 * day) },
          { title: 'Run 50 req/sec benchmark', completed: false },
          { title: 'Identify bottleneck in index updates', completed: false },
          { title: 'Tune poolSize in mongoose connection options', completed: false },
          { title: 'Document concurrency limits', completed: false },
          { title: 'Produce final report', completed: false }
        ],
        comments: [
          { text: 'Connection timeouts observed when pool size was below 20.', author: diana._id, createdAt: new Date(now - 2 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 10 * day) }]
      },
      {
        title: 'Audit Database Security Roles and Grants',
        description: 'Ensure least-privilege access: app user should only have readWrite on smart-taskflow database.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 20 * day),
        createdAt: new Date(now - 1 * day),
        tags: ['security', 'rbac'],
        subtasks: [],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 1 * day) }]
      },
      {
        title: 'Implement MongoDB Change Streams for Real-Time Event Bus',
        description: 'Evaluate watch() on Task collection for triggering downstream notifications.',
        project: proj1._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'cancelled',
        priority: 'low',
        dueDate: new Date(now - 7 * day),
        createdAt: new Date(now - 25 * day),
        tags: ['research', 'change-streams'],
        subtasks: [],
        comments: [
          { text: 'Deprioritized to keep architectural scope focused strictly on REST.', author: alice._id, createdAt: new Date(now - 12 * day) }
        ],
        activityLog: [
          { action: 'status_changed', performedBy: alice._id, oldValue: 'todo', newValue: 'cancelled', timestamp: new Date(now - 12 * day) }
        ]
      },

      // Project 2 Tasks (Analytics Dashboard)
      {
        title: 'Build Tasks Overview Aggregation Pipeline ($facet)',
        description: 'Construct multi-facet pipeline producing status, priority, and overall project metric arrays.',
        project: proj2._id,
        assignee: bob._id,
        createdBy: bob._id,
        status: 'done',
        priority: 'critical',
        dueDate: new Date(now - 10 * day),
        completedAt: new Date(now - 9 * day),
        createdAt: new Date(now - 18 * day),
        tags: ['aggregation', 'facet', 'backend'],
        subtasks: [
          { title: 'Write byStatus grouping pipeline', completed: true, completedAt: new Date(now - 15 * day) },
          { title: 'Write byPriority grouping pipeline', completed: true, completedAt: new Date(now - 12 * day) },
          { title: 'Combine inside $facet operator', completed: true, completedAt: new Date(now - 9 * day) }
        ],
        comments: [
          { text: 'Single database roundtrip returns all high-level stats.', author: bob._id, createdAt: new Date(now - 9 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 18 * day) }]
      },
      {
        title: 'Design Team Workload and Capacity Distribution Chart',
        description: 'Group tasks by assignee and compute breakdown of critical vs normal open tasks.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now + 2 * day), // Due soon
        createdAt: new Date(now - 5 * day),
        tags: ['frontend', 'recharts', 'analytics'],
        subtasks: [
          { title: 'Integrate Recharts BarChart component', completed: true, completedAt: new Date(now - 2 * day) },
          { title: 'Add tooltip displaying workload severity', completed: false },
          { title: 'Wire up live API data fetching', completed: false }
        ],
        comments: [
          { text: 'Mockup completed in Figma, connecting to /api/analytics/workload today.', author: charlie._id, createdAt: new Date(now - 1 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 5 * day) }]
      },
      {
        title: 'Build Project Velocity and Progress Calculation Service',
        description: 'Aggregate percentage completion and velocity across trailing 7-day and 30-day windows.',
        project: proj2._id,
        assignee: bob._id,
        createdBy: bob._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 6 * day),
        completedAt: new Date(now - 5 * day),
        createdAt: new Date(now - 14 * day),
        tags: ['aggregation', 'velocity', 'analytics'],
        subtasks: [
          { title: 'Compute total vs completed counts', completed: true, completedAt: new Date(now - 10 * day) },
          { title: 'Filter completedAt using dateDiff arithmetic', completed: true, completedAt: new Date(now - 6 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 14 * day) }]
      },
      {
        title: 'Implement Overdue Tasks Alert Badge and Filter Panel',
        description: 'Display top overdue tasks sorted by urgency and risk score with direct resolution link.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 4 * day),
        createdAt: new Date(now - 2 * day),
        tags: ['frontend', 'ui', 'alerts'],
        subtasks: [
          { title: 'Create badge notification component', completed: false },
          { title: 'Filter tasks by overdue status', completed: false }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 2 * day) }]
      },
      {
        title: 'Create Full-Text Search Component for Task Catalog',
        description: 'Support search input querying MongoDB text index across title and description.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now - 4 * day), // Overdue!
        createdAt: new Date(now - 15 * day),
        tags: ['search', 'fulltext', 'frontend'],
        subtasks: [
          { title: 'Input debounce hook implementation', completed: true, completedAt: new Date(now - 10 * day) },
          { title: 'API query string formatting', completed: false },
          { title: 'Display highlighted matching snippets', completed: false },
          { title: 'Handle empty search result states', completed: false }
        ],
        comments: [
          { text: 'Delayed due to CSS responsive navbar redesign.', author: charlie._id, createdAt: new Date(now - 3 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 15 * day) }]
      },
      {
        title: 'Build Interactive Subtask Checklist with Optimistic UI',
        description: 'Allow toggling subtask completion directly in task card with live progress bar update.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'review',
        priority: 'medium',
        dueDate: new Date(now + 3 * day),
        createdAt: new Date(now - 6 * day),
        tags: ['subtasks', 'ui', 'components'],
        subtasks: [
          { title: 'Subtask check item UI component', completed: true, completedAt: new Date(now - 2 * day) },
          { title: 'Call PATCH /api/tasks/:id/subtasks/:subtaskId', completed: true, completedAt: new Date(now - 1 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 6 * day) }]
      },
      {
        title: 'Responsive Mobile Layout for Analytics Overview',
        description: 'Ensure charts and data cards stack gracefully on mobile and tablet viewport widths.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 15 * day),
        createdAt: new Date(now - 1 * day),
        tags: ['responsive', 'css', 'mobile'],
        subtasks: [],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 1 * day) }]
      },

      // Project 3 Tasks (AI Risk Predictor)
      {
        title: 'Formulate Overdue Risk Scoring Mathematical Model',
        description: 'Combine priority weights, days until deadline, subtask complexity, and stagnation penalty.',
        project: proj3._id,
        assignee: alice._id,
        createdBy: alice._id,
        status: 'done',
        priority: 'critical',
        dueDate: new Date(now - 8 * day),
        completedAt: new Date(now - 7 * day),
        createdAt: new Date(now - 16 * day),
        tags: ['algorithm', 'risk-score', 'ai'],
        subtasks: [
          { title: 'Define priority multipliers', completed: true, completedAt: new Date(now - 12 * day) },
          { title: 'Formulate deadline proximity decay curve', completed: true, completedAt: new Date(now - 10 * day) },
          { title: 'Validate against synthetic test datasets', completed: true, completedAt: new Date(now - 7 * day) }
        ],
        comments: [
          { text: 'Heuristic model is stable and deterministic within 0-100 range.', author: alice._id, createdAt: new Date(now - 7 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 16 * day) }]
      },
      {
        title: 'Embed Historical Overdue Penalty from Assignee History',
        description: 'Query historical overdue rate per team member and dynamically bias the risk score.',
        project: proj3._id,
        assignee: alice._id,
        createdBy: alice._id,
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(now - 3 * day), // Overdue!
        createdAt: new Date(now - 9 * day),
        tags: ['aggregation', 'scoring', 'machine-learning'],
        subtasks: [
          { title: 'Calculate user historical completion percentage', completed: true, completedAt: new Date(now - 4 * day) },
          { title: 'Feed historical metrics into calculateOverdueRisk', completed: false },
          { title: 'Add test cases for score variations', completed: false }
        ],
        comments: [
          { text: 'Working on passing aggregated historical stats cleanly to riskScoreService.', author: alice._id, createdAt: new Date(now - 2 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 9 * day) }]
      },
      {
        title: 'Expose /api/analytics/riskiest Endpoint for Proactive Escalation',
        description: 'Provide sorted pipeline returning top high-risk tasks requiring project manager attention.',
        project: proj3._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 2 * day),
        completedAt: new Date(now - 1 * day),
        createdAt: new Date(now - 7 * day),
        tags: ['api', 'riskiest', 'analytics'],
        subtasks: [
          { title: 'Build aggregation pipeline with $sort on overdueRiskScore', completed: true, completedAt: new Date(now - 3 * day) },
          { title: 'Include embedded subtask and comment count metrics', completed: true, completedAt: new Date(now - 1 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 7 * day) }]
      },
      {
        title: 'Benchmark Risk Score Re-computation Latency on Document Mutation',
        description: 'Measure execution overhead of calculateOverdueRisk() inside pre-save hooks and patch endpoints.',
        project: proj3._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(now + 12 * day),
        createdAt: new Date(now - 3 * day),
        tags: ['benchmarks', 'performance'],
        subtasks: [
          { title: 'Measure millisecond latency with performance.now()', completed: false },
          { title: 'Check impact during bulk updates', completed: false }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 3 * day) }]
      },
      {
        title: 'Investigate Scikit-Learn Python Microservice for Regression Model',
        description: 'Explore replacing heuristic rules with random forest regression trained on project task durations.',
        project: proj3._id,
        assignee: charlie._id,
        createdBy: alice._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 28 * day),
        createdAt: new Date(now - 2 * day),
        tags: ['future-work', 'python', 'ai'],
        subtasks: [],
        comments: [
          { text: 'Can be explored in future roadmap after CSE494 course demonstration.', author: alice._id, createdAt: new Date(now - 1 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 2 * day) }]
      },

      // Additional Cross-Project Tasks to reach 30+ varied tasks
      {
        title: 'Draft System Architecture Viva Slides and Documentation',
        description: 'Prepare diagrams illustrating embedding vs referencing, indexing strategy, and explain() outputs.',
        project: proj1._id,
        assignee: alice._id,
        createdBy: alice._id,
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(now + 1 * day),
        createdAt: new Date(now - 4 * day),
        tags: ['documentation', 'viva', 'presentation'],
        subtasks: [
          { title: 'Create Mermaid data model diagram', completed: true, completedAt: new Date(now - 1 * day) },
          { title: 'Capture explain() executionStats screenshots', completed: false },
          { title: 'Write aggregation pipeline mathematical breakdown', completed: false }
        ],
        comments: [
          { text: 'Ensure the indexing performance numbers are prominently displayed.', author: alice._id, createdAt: new Date(now - 1 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 4 * day) }]
      },
      {
        title: 'Review Mongoose Middleware Cascades and Hooks',
        description: 'Verify pre-save hooks correctly set updatedAt and sync completedAt timestamp upon status=done.',
        project: proj1._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'done',
        priority: 'medium',
        dueDate: new Date(now - 12 * day),
        completedAt: new Date(now - 11 * day),
        createdAt: new Date(now - 16 * day),
        tags: ['mongoose', 'middleware', 'quality'],
        subtasks: [],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 16 * day) }]
      },
      {
        title: 'Implement JWT Token Expiration and Refresh Policy',
        description: 'Configure 7d expiry and standard Bearer authorization header validation middleware.',
        project: proj2._id,
        assignee: bob._id,
        createdBy: bob._id,
        status: 'done',
        priority: 'high',
        dueDate: new Date(now - 14 * day),
        completedAt: new Date(now - 13 * day),
        createdAt: new Date(now - 18 * day),
        tags: ['auth', 'jwt', 'security'],
        subtasks: [
          { title: 'Add express auth middleware', completed: true, completedAt: new Date(now - 15 * day) },
          { title: 'Add role-based authorization check helper', completed: true, completedAt: new Date(now - 13 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 18 * day) }]
      },
      {
        title: 'Create Reusable Modal for Task Creation and Editing',
        description: 'Build sleek dialog with input validation, date picker, tag chip selector, and assignee dropdown.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date(now - 1 * day), // Overdue!
        createdAt: new Date(now - 8 * day),
        tags: ['ui', 'modal', 'frontend'],
        subtasks: [
          { title: 'Build modal frame with escape key dismissal', completed: true, completedAt: new Date(now - 5 * day) },
          { title: 'Connect to POST /api/tasks', completed: true, completedAt: new Date(now - 2 * day) },
          { title: 'Form error handling and validation highlight', completed: false }
        ],
        comments: [
          { text: 'Almost ready, finalizing validation styling.', author: charlie._id, createdAt: new Date(now - 1 * day) }
        ],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 8 * day) }]
      },
      {
        title: 'Conduct Database Indexing Explain() Performance Benchmark',
        description: 'Execute identical query with and without indexes, recording totalDocsExamined vs nReturned.',
        project: proj1._id,
        assignee: bob._id,
        createdBy: alice._id,
        status: 'in_progress',
        priority: 'critical',
        dueDate: new Date(now + 2 * day),
        createdAt: new Date(now - 5 * day),
        tags: ['indexes', 'explain', 'nosql'],
        subtasks: [
          { title: 'Create analyzePerformance.js script', completed: true, completedAt: new Date(now - 2 * day) },
          { title: 'Benchmark COLLSCAN vs IXSCAN', completed: true, completedAt: new Date(now - 1 * day) },
          { title: 'Record execution metrics in documentation', completed: false }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 5 * day) }]
      },
      {
        title: 'Archive Obsolete Project Sprint Tasks (Soft Delete & TTL Validation)',
        description: 'Test soft deletion flag isArchived=true and verify TTL index handles automatic retention.',
        project: proj1._id,
        assignee: diana._id,
        createdBy: alice._id,
        status: 'todo',
        priority: 'low',
        dueDate: new Date(now + 18 * day),
        createdAt: new Date(now - 2 * day),
        tags: ['ttl', 'cleanup', 'soft-delete'],
        subtasks: [],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 2 * day) }]
      },
      {
        title: 'Configure CORS and Production Security Headers',
        description: 'Setup appropriate CORS origin whitelist and security defaults in Express application.',
        project: proj2._id,
        assignee: bob._id,
        createdBy: bob._id,
        status: 'done',
        priority: 'medium',
        dueDate: new Date(now - 16 * day),
        completedAt: new Date(now - 15 * day),
        createdAt: new Date(now - 22 * day),
        tags: ['cors', 'security', 'express'],
        subtasks: [],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 22 * day) }]
      },
      {
        title: 'Design Dark Mode Theme for Viva Demo UI',
        description: 'Add sleek slate-900 / indigo color scheme with high contrast charts for projector display.',
        project: proj2._id,
        assignee: charlie._id,
        createdBy: bob._id,
        status: 'done',
        priority: 'low',
        dueDate: new Date(now - 5 * day),
        completedAt: new Date(now - 4 * day),
        createdAt: new Date(now - 10 * day),
        tags: ['ui', 'dark-mode', 'theme'],
        subtasks: [
          { title: 'Define CSS color tokens', completed: true, completedAt: new Date(now - 7 * day) },
          { title: 'Style Recharts tooltip and gridlines', completed: true, completedAt: new Date(now - 4 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: bob._id, timestamp: new Date(now - 10 * day) }]
      },
      {
        title: 'Stress Test Risk Scoring Under Extreme Deadlines',
        description: 'Simulate high subtask counts and near-zero deadline intervals to evaluate 0-100 score bounds.',
        project: proj3._id,
        assignee: alice._id,
        createdBy: alice._id,
        status: 'review',
        priority: 'high',
        dueDate: new Date(now + 2 * day),
        createdAt: new Date(now - 4 * day),
        tags: ['qa', 'risk-score', 'boundary-test'],
        subtasks: [
          { title: 'Test 0-subtask baseline', completed: true, completedAt: new Date(now - 2 * day) },
          { title: 'Test 20-subtask edge condition', completed: true, completedAt: new Date(now - 1 * day) }
        ],
        comments: [],
        activityLog: [{ action: 'task_created', performedBy: alice._id, timestamp: new Date(now - 4 * day) }]
      }
    ];

    // Compute overdueRiskScore for each task template before creating
    const tasksToInsert = taskTemplates.map((template) => {
      const score = calculateOverdueRisk(template);
      return {
        ...template,
        overdueRiskScore: score,
        updatedAt: template.completedAt || template.createdAt || new Date()
      };
    });

    const createdTasks = await Task.insertMany(tasksToInsert);
    console.log(`[Seed] Created ${createdTasks.length} tasks successfully with calculated risk scores!`);

    console.log('[Seed] Database successfully seeded with full realistic dataset!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;

