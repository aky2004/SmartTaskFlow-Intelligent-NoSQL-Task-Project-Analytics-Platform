import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import OverviewCards from '../components/analytics/OverviewCards';
import StatusChart from '../components/analytics/StatusChart';
import TaskCard from '../components/tasks/TaskCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import { Plus, ArrowRight, FolderKanban, CheckSquare, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      const [overviewRes, tasksRes, projRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/tasks?sort=-createdAt&isArchived=false'),
        api.get('/projects')
      ]);

      if (overviewRes.data?.data) {
        setMetrics(overviewRes.data.data.metrics[0] || {});
        setStatusData(overviewRes.data.data.byStatus || []);
      }
      setRecentTasks((tasksRes.data?.data?.tasks || []).slice(0, 6));
      setProjects(projRes.data?.data?.projects || []);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateTask = async (taskPayload) => {
    await api.post('/tasks', taskPayload);
    setIsTaskModalOpen(false);
    loadDashboardData();
  };

  if (loading) return <Loader text="Loading live NoSQL dashboard analytics..." />;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/40 to-slate-900/60">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              CSE494 Advanced NoSQL Platform
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">SmartTaskFlow Command Center</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Real-time project telemetry driven by MongoDB compound indexes, multi-stage aggregation pipelines ($facet, $lookup), and intelligent risk prediction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>
            <FolderKanban className="w-3.5 h-3.5" />
            Projects ({projects.length})
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Top Aggregation Cards */}
      <OverviewCards metrics={metrics} />

      {/* Main Grid: Status Chart + Quick Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatusChart data={statusData} />
        </div>

        {/* Active Projects Quick Glance */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Active Projects Workspace</h3>
              <p className="text-xs text-slate-400">Referenced entity boundaries</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.slice(0, 4).map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-mono uppercase text-indigo-400 font-semibold">{p.status}</span>
                  <span className="text-slate-500">{p.members?.length || 1} team members</span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{p.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks Catalog */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Tasks</h3>
            <p className="text-xs text-slate-400">Latest tasks showing embedded subtasks &amp; AI risk evaluation</p>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            Explore All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task with Embedded Documents"
      >
        <TaskForm
          projects={projects}
          users={users}
          onSubmit={handleCreateTask}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;

