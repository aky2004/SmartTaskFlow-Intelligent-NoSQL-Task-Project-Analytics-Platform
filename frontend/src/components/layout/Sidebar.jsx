import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Cpu,
  Layers
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Tasks Catalog', path: '/tasks', icon: CheckSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              SmartTaskFlow
            </h1>
            <span className="text-[10px] text-indigo-400 font-mono font-medium">CSE494 NoSQL</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">Platform</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Schema modeling pill banner */}
      <div className="p-4 m-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
          <Cpu className="w-3.5 h-3.5" />
          <span>MongoDB Highlights</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Embedded Subtasks &amp; Comments • Compound Indexing • $facet Aggregations
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

