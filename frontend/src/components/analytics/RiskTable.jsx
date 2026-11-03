import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getRiskInfo } from '../../utils/helpers';
import { AlertCircle, ArrowUpRight } from 'lucide-react';

const RiskTable = ({ tasks = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold text-white">Top Riskiest Tasks (AI Risk Engine)</h3>
            <p className="text-xs text-slate-400">Sorted descending by overdueRiskScore computed from deadline & complexity weights</p>
          </div>
        </div>
        <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-lg font-mono">
          /api/analytics/riskiest
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3">Project</th>
              <th className="py-2.5 px-3">Assignee</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                  No high-risk tasks detected. All deadlines are healthy!
                </td>
              </tr>
            ) : (
              tasks.map((t) => {
                const risk = getRiskInfo(t.overdueRiskScore);
                return (
                  <tr key={t._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold ${risk.bg} ${risk.color} border ${risk.border}`}>
                        {t.overdueRiskScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">
                      {t.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-[150px] truncate">
                      {t.projectName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {t.assigneeName}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold">
                      {t.priority}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {formatDate(t.dueDate)}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => navigate(`/tasks/${t._id}`)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-indigo-400 transition"
                        title="View Task Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskTable;

