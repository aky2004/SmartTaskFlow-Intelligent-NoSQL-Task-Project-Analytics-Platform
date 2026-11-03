/**
 * Intelligent Feature – Overdue Risk Score Service
 * 
 * Computes a predictive risk score between 0 and 100 indicating the probability
 * of a task missing its deadline. Combines rule-based heuristics with historical
 * performance analytics.
 */

const daysUntil = (targetDate) => {
  const diffTime = new Date(targetDate).getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const daysSince = (pastDate) => {
  const diffTime = Date.now() - new Date(pastDate).getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates overdue risk score (0 - 100)
 * @param {Object} task - Mongoose task document or plain object
 * @param {Object} historicalStats - Optional aggregated historical metrics
 * @returns {number} Score from 0 to 100
 */
const calculateOverdueRisk = (task, historicalStats = null) => {
  // If task is completed or cancelled, overdue risk is 0
  if (['done', 'cancelled'].includes(task.status)) {
    return 0;
  }

  let score = 0;

  // 1. Priority weighting
  if (task.priority === 'critical') {
    score += 30;
  } else if (task.priority === 'high') {
    score += 20;
  } else if (task.priority === 'medium') {
    score += 10;
  }

  // 2. Proximity to Due Date
  if (task.dueDate) {
    const daysLeft = daysUntil(task.dueDate);
    if (daysLeft < 0) {
      // Already past due date
      score += 40;
    } else if (daysLeft <= 1) {
      score += 30;
    } else if (daysLeft <= 3) {
      score += 25;
    } else if (daysLeft <= 7) {
      score += 15;
    }
  }

  // 3. Complexity / Subtask Volume
  const subtasksCount = task.subtasks ? task.subtasks.length : 0;
  const incompleteSubtasks = task.subtasks
    ? task.subtasks.filter(s => !s.completed).length
    : 0;

  if (subtasksCount > 5) {
    score += 10;
  }
  if (incompleteSubtasks >= 3) {
    score += 10;
  }

  // 4. Stagnation penalty (task has lingered in 'todo' for too long)
  const taskCreated = task.createdAt || Date.now();
  if (task.status === 'todo' && daysSince(taskCreated) > 7) {
    score += 15;
  } else if (task.status === 'in_progress' && daysSince(taskCreated) > 14) {
    score += 10;
  }

  // 5. Intelligent historical adjustment (if historical statistics are supplied)
  if (historicalStats && typeof historicalStats.assigneeOverdueRate === 'number') {
    // If assignee has > 30% overdue history, add up to 10 points
    score += Math.round(historicalStats.assigneeOverdueRate * 10);
  }

  return Math.min(100, Math.max(0, score));
};

module.exports = {
  calculateOverdueRisk,
  daysUntil,
  daysSince
};

