import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Layers, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('alice@smarttaskflow.io');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (userEmail) => {
    setEmail(userEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center font-black text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to SmartTaskFlow</h2>
          <p className="text-xs text-slate-400">Advanced NoSQL Project &amp; Task Analytics Platform (CSE494)</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@smarttaskflow.io"
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Accounts Switcher */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold text-center">
              Quick Viva Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoUser('alice@smarttaskflow.io')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 text-left transition"
              >
                <span className="font-semibold block text-indigo-400">Alice (Admin)</span>
                <span className="text-[10px] text-slate-500">alice@smarttaskflow.io</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoUser('bob@smarttaskflow.io')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 text-left transition"
              >
                <span className="font-semibold block text-emerald-400">Bob (Dev)</span>
                <span className="text-[10px] text-slate-500">bob@smarttaskflow.io</span>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

