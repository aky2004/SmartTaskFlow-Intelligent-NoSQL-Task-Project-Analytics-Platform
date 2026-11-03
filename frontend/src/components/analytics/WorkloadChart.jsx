import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const WorkloadChart = ({ data = [] }) => {
  const chartData = data.map(item => ({
    name: item.userName ? item.userName.split(' ')[0] : 'Unassigned',
    critical: item.criticalTasks || 0,
    high: item.highTasks || 0,
    normal: item.mediumOrLowTasks || 0,
    total: item.totalOpenTasks || 0
  }));

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Team Workload Distribution</h3>
          <p className="text-xs text-slate-400 font-mono">Aggregation: $group by assignee + $lookup users</p>
        </div>
        <span className="text-[11px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono">
          Capacity Monitor
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px'
              }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
            <Bar dataKey="high" name="High" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
            <Bar dataKey="normal" name="Normal" stackId="a" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkloadChart;

