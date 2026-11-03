const mongoose = require('mongoose');
const config = require('../config');
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');

const createIndexes = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Indexes] Connected to MongoDB');

    console.log('[Indexes] Ensuring User and Project indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await Project.collection.createIndex({ owner: 1 });
    await Project.collection.createIndex({ status: 1 });

    console.log('[Indexes] Resetting collection indexes for clean recreation...');
    await Task.collection.dropIndexes().catch(() => {});

    console.log('[Indexes] Creating Task collection indexes specified in Section 6...');

    // Compound indexes
    await Task.collection.createIndex({ project: 1, status: 1, dueDate: 1 });
    console.log(' -> Created compound index: { project: 1, status: 1, dueDate: 1 }');

    await Task.collection.createIndex({ assignee: 1, status: 1 });
    console.log(' -> Created compound index: { assignee: 1, status: 1 }');

    await Task.collection.createIndex({ dueDate: 1, status: 1 });
    console.log(' -> Created compound index: { dueDate: 1, status: 1 }');

    // Text index
    await Task.collection.createIndex(
      { title: 'text', description: 'text' },
      { weights: { title: 5, description: 1 }, default_language: 'english' }
    );
    console.log(' -> Created text index: { title: "text", description: "text" }');

    // Single field
    await Task.collection.createIndex({ priority: 1 });
    console.log(' -> Created single field index: { priority: 1 }');

    await Task.collection.createIndex({ overdueRiskScore: -1 });
    console.log(' -> Created single field index: { overdueRiskScore: -1 }');

    // Multikey index
    await Task.collection.createIndex({ tags: 1 });
    console.log(' -> Created multikey index: { tags: 1 }');

    // TTL partial index for archived tasks
    await Task.collection.createIndex(
      { updatedAt: 1 },
      {
        expireAfterSeconds: 60 * 60 * 24 * 180,
        partialFilterExpression: { isArchived: true }
      }
    );
    console.log(' -> Created TTL partial index on updatedAt for archived tasks');

    console.log('\n[Indexes] Active indexes on Task collection:');
    const indexes = await Task.collection.indexes();
    indexes.forEach((idx) => {
      console.log(` • ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n[Indexes] Successfully verified and applied all indexes!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Indexes] Error creating indexes:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;
