import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckSquare, MessageSquare, AlertCircle } from 'lucide-react';
import { formatDate, getPriorityBadge, getStatusBadge, getRiskInfo } from '../../utils/helpers';

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const priority = getPriorityBadge(task.priority);
  const status = getStatusBadge(task.status);
  const risk = getRiskInfo(task.overdueRiskScore);

  const subtasks = task.subtasks || [];
  const completedSub = subtasks.filter((s) => s.completed).length;

  return (
    <div
      onClick={() => navigate(`/tasks/${task._id}`)}
      className="glass-card hover:border-indigo-500/50 rounded-2xl p-5 transition duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${status.bg}`}>
            {status.label}
          </span>
          <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase font-bold tracking-wider ${priority.bg}`}>
            {priority.label}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition line-clamp-1">
            {task.title}
          </h4>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Intelligent Risk Score Gauge */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <AlertCircle className={`w-3 h-3 ${risk.color}`} />
              Overdue Risk
            </span>
            <span className={`font-mono font-bold ${risk.color}`}>
              {task.overdueRiskScore || 0}/100
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${risk.bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, task.overdueRiskScore || 0)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            {completedSub}/{subtasks.length}
          </span>
          {task.comments?.length > 0 && (
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              {task.comments.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

