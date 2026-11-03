import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import TaskList from '../components/tasks/TaskList';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import Loader from '../components/ui/Loader';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasksData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks?sort=-overdueRiskScore&isArchived=false'),
        api.get('/projects')
      ]);

      setTasks(tasksRes.data?.data?.tasks || []);
      setProjects(projectsRes.data?.data?.projects || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksData();
  }, []);

  const handleCreateTask = async (taskPayload) => {
    await api.post('/tasks', taskPayload);
    setIsModalOpen(false);
    fetchTasksData();
  };

  if (loading) return <Loader text="Loading tasks catalog..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tasks Catalog</h2>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid document schema with embedded subtasks &amp; comments ({tasks.length} tasks)
          </p>
        </div>
      </div>

      <TaskList
        tasks={tasks}
        onNewTask={() => setIsModalOpen(true)}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
      >
        <TaskForm
          projects={projects}
          users={users}
          onSubmit={handleCreateTask}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Tasks;

