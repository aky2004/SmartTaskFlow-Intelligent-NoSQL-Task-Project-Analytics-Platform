export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRiskInfo = (score = 0) => {
  if (score >= 70) {
    return {
      label: 'Critical Risk',
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/30',
      bar: 'bg-rose-500'
    };
  }
  if (score >= 40) {
    return {
      label: 'Moderate Risk',
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
      bar: 'bg-amber-500'
    };
  }
  return {
    label: 'Low Risk',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    bar: 'bg-emerald-500'
  };
};

export const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'critical':
      return { label: 'Critical', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    case 'high':
      return { label: 'High', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' };
    case 'medium':
      return { label: 'Medium', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    default:
      return { label: 'Low', bg: 'bg-slate-700/50 text-slate-300 border-slate-600' };
  }
};

export const getStatusBadge = (status) => {
  switch (status) {
    case 'done':
      return { label: 'Completed', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    case 'in_progress':
      return { label: 'In Progress', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
    case 'review':
      return { label: 'Under Review', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    case 'cancelled':
      return { label: 'Cancelled', bg: 'bg-rose-950/40 text-rose-400 border-rose-900/60' };
    default:
      return { label: 'To Do', bg: 'bg-slate-800 text-slate-300 border-slate-700' };
  }
};

