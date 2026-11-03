import { useState, useCallback } from 'react';
import api from '../api/axios';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.project) params.append('project', filters.project);
      if (filters.status) params.append('status', filters.status);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.data.tasks || []);
      return res.data.data.tasks;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    const res = await api.post('/tasks', taskData);
    const newTask = res.data.data.task;
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id, updateData) => {
    const res = await api.patch(`/tasks/${id}`, updateData);
    const updated = res.data.data.task;
    setTasks(prev => prev.map(t => t._id === id ? updated : t));
    return updated;
  };

  const deleteTask = async (id, hard = false) => {
    await api.delete(`/tasks/${id}?hard=${hard}`);
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  };
};

