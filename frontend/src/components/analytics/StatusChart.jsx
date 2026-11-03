import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

const StatusChart = ({ data = [] }) => {
  const formattedData = data.map(item => ({
    name: item._id ? item._id.toUpperCase().replace('_', ' ') : 'UNKNOWN',
    value: item.count
  }));

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Tasks by Status Breakdown</h3>
          <p className="text-xs text-slate-400 font-mono">Aggregation: $facet.byStatus</p>
        </div>
        <span className="text-[11px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono">
          Single Roundtrip
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px'
              }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusChart;

