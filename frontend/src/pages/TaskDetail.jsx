import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskDetails from '../components/tasks/TaskDetails';
import Loader from '../components/ui/Loader';
import Modal from '../components/ui/Modal';
import TaskForm from '../components/tasks/TaskForm';
import { ArrowLeft } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchTask = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get('/projects')
      ]);
      setTask(taskRes.data?.data?.task || null);
      setProjects(projRes.data?.data?.projects || []);
    } catch (err) {
      console.error('Error fetching task:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleUpdate = async (updatePayload) => {
    await api.patch(`/tasks/${id}`, updatePayload);
    setIsEditModalOpen(false);
    fetchTask();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete or archive this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        navigate('/tasks');
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  if (loading) return <Loader text="Loading task document with embedded data..." />;
  if (!task) return <div className="text-center py-12 text-slate-400">Task document not found.</div>;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tasks Catalog
      </button>

      <TaskDetails
        task={task}
        onTaskUpdated={fetchTask}
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Task Document"
      >
        <TaskForm
          initialData={task}
          projects={projects}
          users={users}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default TaskDetail;

