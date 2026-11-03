import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { Search, Filter, Plus } from 'lucide-react';
import Button from '../ui/Button';

const TaskList = ({ tasks = [], onNewTask, filterStatus, onFilterStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const statuses = [
    { id: '', label: 'All Tasks' },
    { id: 'todo', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'review', label: 'Under Review' },
    { id: 'done', label: 'Done' }
  ];

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesPriority = priorityFilter ? task.priority === priorityFilter : true;
    const matchesSearch = searchTerm
      ? task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Search & Actions Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks by title, description or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {onNewTask && (
            <Button size="sm" onClick={onNewTask}>
              <Plus className="w-3.5 h-3.5" />
              New Task
            </Button>
          )}
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s.id}
            onClick={() => onFilterStatusChange(s.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
              filterStatus === s.id
                ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredTasks.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
          <p className="text-slate-400 text-sm">No tasks found matching current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;

