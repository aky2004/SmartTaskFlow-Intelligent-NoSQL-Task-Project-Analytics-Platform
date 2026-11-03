import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskCard from '../components/tasks/TaskCard';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Plus 
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import Badge from '../components/ui/Badge';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const loadProjectData = async () => {
    try {
      const [projRes, tasksRes, progRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?project=${id}&isArchived=false`),
        api.get(`/analytics/project/${id}/progress`)
      ]);

      setProject(projRes.data?.data?.project || null);
      setTasks(tasksRes.data?.data?.tasks || []);
      setProgress(progRes.data?.data?.progress || null);
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleCreateTask = async (taskPayload) => {
    await api.post('/tasks', { ...taskPayload, project: id });
    setIsTaskModalOpen(false);
    loadProjectData();
  };

  if (loading) return <Loader text="Loading project & pipeline telemetry..." />;
  if (!project) return <div className="text-center py-12 text-slate-400">Project not found.</div>;

  const completionPct = progress?.completionPercentage ?? 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
      </button>

      {/* Project Overview Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{project.name}</h2>
              <Badge variant="success" className="uppercase text-[10px]">
                {project.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <Button size="sm" onClick={() => setIsTaskModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </Button>
        </div>

        {/* Progress Bar & Velocity (Aggregation Pipeline 4) */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Project Completion Progress (MongoDB Aggregation)
            </span>
            <span className="font-mono font-bold text-indigo-400">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            ></div>
          </div>

          {/* Velocity & Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">Completed / Total</span>
              <span className="text-white font-bold">{progress?.completedTasks || 0} / {progress?.totalTasks || tasks.length}</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">Velocity (7 Days)</span>
              <span className="text-emerald-400 font-bold">+{progress?.velocityLast7Days || 0} done</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">Velocity (30 Days)</span>
              <span className="text-indigo-400 font-bold">+{progress?.velocityLast30Days || 0} done</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-500 text-[10px] block">Avg Risk Score</span>
              <span className="text-amber-400 font-bold">{progress?.avgRiskScore || 0}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Project Tasks ({tasks.length})</h3>
          <span className="text-xs text-slate-500 font-mono">Referenced by project: {project._id}</span>
        </div>

        {tasks.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-slate-800 text-slate-500 text-xs">
            No tasks found for this project. Click "Add Task" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        )}
      </div>

      {/* Task Creation Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title={`Add Task to ${project.name}`}
      >
        <TaskForm
          projects={[project]}
          users={[]}
          onSubmit={handleCreateTask}
          onCancel={() => setIsTaskModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProjectDetail;

