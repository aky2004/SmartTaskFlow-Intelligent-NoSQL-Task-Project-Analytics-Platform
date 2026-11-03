import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, FolderCheck, ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import Badge from '../ui/Badge';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const statusVariant = {
    active: 'success',
    completed: 'primary',
    archived: 'default'
  }[project.status] || 'default';

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="glass-card hover:border-indigo-500/50 rounded-2xl p-5 transition duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-indigo-500/5"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={statusVariant} className="uppercase text-[10px]">
            {project.status}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.members?.length || 1} members</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition line-clamp-1">
            {project.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Created: {formatDate(project.createdAt)}</span>
        </div>

        <span className="text-indigo-400 font-medium text-xs flex items-center gap-1 group-hover:translate-x-1 transition duration-150">
          Details <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;

