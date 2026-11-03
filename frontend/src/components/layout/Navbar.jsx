import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse"></span>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline">MongoDB 7.0 Cluster • Active</span>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <div className="flex items-center space-x-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">{user.email}</p>
            </div>
            <Badge variant={user.role === 'admin' ? 'primary' : 'default'} className="text-[10px] uppercase">
              {user.role}
            </Badge>
          </div>
        )}

        <button
          onClick={logout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;

