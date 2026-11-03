import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Layers, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 items-center justify-center font-black text-white shadow-xl shadow-indigo-500/20 mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-400">Join the SmartTaskFlow NoSQL Analytics Workspace</p>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Turner"
              required
            />

            <Input
              label="Email Address"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@smarttaskflow.io"
              required
            />

            <Input
              label="Password (min 6 chars)"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="user">Team Member (User)</option>
                <option value="admin">Project Administrator (Admin)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

