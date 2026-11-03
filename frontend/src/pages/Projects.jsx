import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ProjectList from '../components/projects/ProjectList';
import Modal from '../components/ui/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import Loader from '../components/ui/Loader';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data?.data?.projects || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (formData) => {
    await api.post('/projects', formData);
    setIsModalOpen(false);
    fetchProjects();
  };

  if (loading) return <Loader text="Loading projects..." />;

  return (
    <div className="space-y-6">
      <ProjectList
        projects={projects}
        onNewProject={() => setIsModalOpen(true)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Projects;

