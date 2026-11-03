import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

const OverviewCards = ({ metrics = {} }) => {
  const cards = [
    {
      title: 'Total Tasks',
      value: metrics.totalTasks ?? 0,
      subtext: 'Pipeline: $facet.metrics',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      title: 'Completed Tasks',
      value: metrics.completedTasks ?? 0,
      subtext: 'Conditional: status == done',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      title: 'Overdue Items',
      value: metrics.overdueCount ?? 0,
      subtext: 'dueDate < now && !done',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      title: 'Avg Overdue Risk',
      value: `${Math.round(metrics.avgRiskScore || 0)} / 100`,
      subtext: 'Intelligent AI heuristic',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">{card.title}</span>
              <div className={`p-2 rounded-xl border ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <h3 className={`text-2xl font-black ${card.color}`}>{card.value}</h3>
            <p className="text-[11px] text-slate-500 font-mono">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewCards;

