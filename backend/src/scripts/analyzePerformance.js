const mongoose = require('mongoose');
const config = require('../config');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const runPerformanceAnalysis = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('='.repeat(70));
    console.log('   SmartTaskFlow: MongoDB Index Performance & explain() Demo');
    console.log('='.repeat(70));

    const sampleProject = await Project.findOne();
    const sampleUser = await User.findOne({ email: 'diana@smarttaskflow.io' });

    if (!sampleProject) {
      console.log('Please run npm run seed first to populate data!');
      await mongoose.disconnect();
      return;
    }

    const testQuery = {
      project: sampleProject._id,
      status: 'in_progress'
    };

    console.log('\n[Benchmark Query Scenario]');
    console.log('Filter:', JSON.stringify(testQuery));
    console.log('Target Collection: tasks\n');

    // Scenario A: Force Full Collection Scan (COLLSCAN) using { $natural: 1 } hint
    console.log('▶ Running Query with NO INDEX (Forced COLLSCAN via $natural hint)...');
    const unindexedExplain = await Task.collection
      .find(testQuery)
      .hint({ $natural: 1 })
      .explain('executionStats');

    const unindexedStats = unindexedExplain.executionStats;
    const unindexedStage = unindexedStats.executionStages.stage;

    console.log(`  Stage:                 ${unindexedStage}`);
    console.log(`  Docs Examined:         ${unindexedStats.totalDocsExamined}`);
    console.log(`  Docs Returned:         ${unindexedStats.nReturned}`);
    console.log(`  Execution Time (ms):   ${unindexedStats.executionTimeMillis} ms`);

    // Scenario B: Execute with Compound Index { project: 1, status: 1, dueDate: 1 }
    console.log('\n▶ Running Query WITH COMPOUND INDEX ({ project: 1, status: 1, dueDate: 1 })...');
    const indexedExplain = await Task.collection
      .find(testQuery)
      .hint({ project: 1, status: 1, dueDate: 1 })
      .explain('executionStats');

    const indexedStats = indexedExplain.executionStats;
    let indexedStage = indexedStats.executionStages.stage;
    let indexUsed = 'N/A';

    if (indexedStats.executionStages.inputStage) {
      indexedStage = `${indexedStats.executionStages.stage} -> ${indexedStats.executionStages.inputStage.stage}`;
      indexUsed = indexedStats.executionStages.inputStage.indexName;
    } else if (indexedStats.executionStages.indexName) {
      indexUsed = indexedStats.executionStages.indexName;
    }

    console.log(`  Stage:                 ${indexedStage}`);
    console.log(`  Index Used:            ${indexUsed}`);
    console.log(`  Docs Examined:         ${indexedStats.totalDocsExamined}`);
    console.log(`  Keys Examined:         ${indexedStats.totalKeysExamined}`);
    console.log(`  Docs Returned:         ${indexedStats.nReturned}`);
    console.log(`  Execution Time (ms):   ${indexedStats.executionTimeMillis} ms`);

    // Scenario C: Full Text Search explain()
    console.log('\n▶ Running FULL-TEXT SEARCH explain() on title & description:');
    const textExplain = await Task.collection
      .find({ $text: { $search: 'MongoDB' } })
      .explain('executionStats');

    const textStats = textExplain.executionStats;
    console.log(`  Stage:                 ${textStats.executionStages.stage}`);
    console.log(`  Keys Examined:         ${textStats.totalKeysExamined}`);
    console.log(`  Docs Examined:         ${textStats.totalDocsExamined}`);
    console.log(`  Docs Returned:         ${textStats.nReturned}`);

    // Summary Comparison Table
    console.log('\n' + '='.repeat(70));
    console.log('              PERFORMANCE COMPARISON SUMMARY');
    console.log('='.repeat(70));
    console.table([
      {
        Metric: 'Scan Strategy',
        'Without Index (COLLSCAN)': 'COLLSCAN (Full Scan)',
        'With Index (IXSCAN)': 'IXSCAN (Index Seek)',
        Improvement: 'Direct B-Tree Lookup'
      },
      {
        Metric: 'Documents Examined',
        'Without Index (COLLSCAN)': unindexedStats.totalDocsExamined,
        'With Index (IXSCAN)': indexedStats.totalDocsExamined,
        Improvement: `${((1 - indexedStats.totalDocsExamined / Math.max(1, unindexedStats.totalDocsExamined)) * 100).toFixed(1)}% fewer docs examined`
      },
      {
        Metric: 'Execution Time',
        'Without Index (COLLSCAN)': `${unindexedStats.executionTimeMillis} ms`,
        'With Index (IXSCAN)': `${indexedStats.executionTimeMillis} ms`,
        Improvement: 'Sub-millisecond retrieval'
      }
    ]);
    console.log('='.repeat(70));
    console.log('Key Viva Takeaway:');
    console.log('Indexes reduce disk I/O and CPU workload by narrowing search bounds');
    console.log('from O(N) linear scan down to O(log N) indexed B-tree lookups.');
    console.log('='.repeat(70) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Performance analysis error:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runPerformanceAnalysis();
}

module.exports = runPerformanceAnalysis;
