import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  History, 
  AlertTriangle, 
  Plus, 
  User as UserIcon, 
  Folder, 
  Tag, 
  Check, 
  Clock 
} from 'lucide-react';
import { formatDate, formatDateTime, getRiskInfo, getPriorityBadge, getStatusBadge } from '../../utils/helpers';
import Button from '../ui/Button';
import api from '../../api/axios';

const TaskDetails = ({ task, onTaskUpdated, onEdit, onDelete }) => {
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [comments, setComments] = useState(task.comments || []);
  const [activityLog, setActivityLog] = useState(task.activityLog || []);
  const [riskScore, setRiskScore] = useState(task.overdueRiskScore || 0);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [subtaskLoading, setSubtaskLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

  const risk = getRiskInfo(riskScore);
  const priority = getPriorityBadge(task.priority);
  const status = getStatusBadge(task.status);

  // Toggle subtask completion
  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await api.patch(`/tasks/${task._id}/subtasks/${subtaskId}`, {
        completed: !currentStatus
      });
      const updatedSubtask = res.data.data.subtask;
      const newSubtasks = subtasks.map(s => s._id === subtaskId ? updatedSubtask : s);
      setSubtasks(newSubtasks);
      if (typeof res.data.data.overdueRiskScore === 'number') {
        setRiskScore(res.data.data.overdueRiskScore);
      }
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error updating subtask:', err);
    }
  };

  // Add new subtask
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtaskLoading(true);
    try {
      const res = await api.post(`/tasks/${task._id}/subtasks`, {
        title: newSubtaskTitle.trim()
      });
      setSubtasks(res.data.data.subtasks);
      if (typeof res.data.data.overdueRiskScore === 'number') {
        setRiskScore(res.data.data.overdueRiskScore);
      }
      setNewSubtaskTitle('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error adding subtask:', err);
    } finally {
      setSubtaskLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, {
        text: newCommentText.trim()
      });
      setComments(res.data.data.comments);
      setNewCommentText('');
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Header Box */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.bg}`}>
              {status.label}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-bold tracking-wider border ${priority.bg}`}>
              {priority.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button size="sm" variant="secondary" onClick={onEdit}>
                Edit Task
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="danger" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">{task.title}</h2>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {task.description || 'No description provided.'}
        </p>

        {/* Referencing metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Folder className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="block text-[10px] uppercase font-medium text-slate-500">Project (Referenced)</span>
              <span className="text-slate-200 font-semibold">{task.project?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="block text-[10px] uppercase font-medium text-slate-500">Assignee (Referenced)</span>
              <span className="text-slate-200 font-semibold">{task.assignee?.name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="block text-[10px] uppercase font-medium text-slate-500">Due Date</span>
              <span className="text-slate-200 font-semibold">{formatDate(task.dueDate)}</span>
            </div>
          </div>
        </div>

        {task.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            {task.tags.map((t, idx) => (
              <span key={idx} className="bg-slate-800/80 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-md font-mono">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Intelligent Overdue Risk Score Showcase */}
      <div className={`rounded-2xl p-5 border ${risk.border} ${risk.bg} space-y-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${risk.color}`} />
            <h3 className="text-sm font-bold text-white">Intelligent Overdue Risk Engine (0–100)</h3>
          </div>
          <span className={`text-lg font-mono font-black ${risk.color}`}>
            {riskScore}/100
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Dynamic risk prediction model evaluating task priority (+{task.priority === 'critical' ? '30' : task.priority === 'high' ? '20' : '10'}), deadline proximity decay, subtask complexity burden, and stagnation penalties.
        </p>
        <div className="w-full bg-slate-900/60 h-2 rounded-full overflow-hidden">
          <div className={`h-full ${risk.bar} transition-all duration-700`} style={{ width: `${riskScore}%` }}></div>
        </div>
      </div>

      {/* Embedded Subtasks Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">
              Subtasks Checklist <span className="text-xs text-indigo-400 font-mono font-normal">(Embedded 1:Many)</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {subtasks.filter(s => s.completed).length} of {subtasks.length} completed
          </span>
        </div>

        {/* Add subtask input */}
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new embedded subtask item..."
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Button size="sm" type="submit" loading={subtaskLoading}>
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </form>

        {/* Subtask list */}
        <div className="space-y-2 pt-2">
          {subtasks.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No subtasks created for this task yet.</p>
          ) : (
            subtasks.map((st) => (
              <div
                key={st._id}
                onClick={() => handleToggleSubtask(st._id, st.completed)}
                className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer select-none ${
                  st.completed
                    ? 'bg-emerald-950/20 border-emerald-800/30 text-slate-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                    st.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-600'
                  }`}>
                    {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`text-xs ${st.completed ? 'line-through text-slate-500' : ''}`}>
                    {st.title}
                  </span>
                </div>
                {st.completedAt && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatDate(st.completedAt)}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Embedded Comments Section */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Task Conversation <span className="text-xs text-indigo-400 font-mono font-normal">(Embedded 1:Many)</span>
          </h3>
        </div>

        <form onSubmit={handleAddComment} className="space-y-2">
          <textarea
            rows={2}
            placeholder="Write a comment or status update..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end">
            <Button size="sm" type="submit" loading={commentLoading}>
              Post Comment
            </Button>
          </div>
        </form>

        <div className="space-y-3 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No comments posted yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-indigo-300">
                    {c.author?.name || 'Team Member'}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {formatDateTime(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Activity Log Audit Trail */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">
            Audit Activity Trail <span className="text-xs text-indigo-400 font-mono font-normal">(Embedded Log)</span>
          </h3>
        </div>

        <div className="space-y-2.5">
          {activityLog.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No audit events recorded.</p>
          ) : (
            activityLog.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-mono text-indigo-400 text-[11px] font-semibold uppercase tracking-wider">
                    {log.action}
                  </span>
                  <span className="text-slate-400 ml-1">
                    by {log.performedBy?.name || 'System'}
                  </span>
                  {log.oldValue !== undefined && log.newValue !== undefined && (
                    <span className="text-slate-500 ml-1">
                      ({String(log.oldValue)} &rarr; {String(log.newValue)})
                    </span>
                  )}
                  <span className="text-slate-600 text-[10px] ml-2 font-mono">
                    {formatDateTime(log.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

