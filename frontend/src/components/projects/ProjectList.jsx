import React from 'react';
import ProjectCard from './ProjectCard';
import Button from '../ui/Button';
import { Plus, FolderKanban } from 'lucide-react';

const ProjectList = ({ projects = [], onNewProject }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Active Projects</h2>
          <p className="text-xs text-slate-400 mt-1">
            Top-level referenced workspace boundaries ({projects.length} total)
          </p>
        </div>

        {onNewProject && (
          <Button onClick={onNewProject} size="sm">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No projects found. Create your first project to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;

