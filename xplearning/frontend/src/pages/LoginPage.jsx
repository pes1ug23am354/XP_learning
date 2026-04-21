import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: form.email, password: form.password } : form;
      const res = await api.post(endpoint, payload);
      setUser(res.data.data.token, res.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass w-full max-w-md rounded-2xl p-6"
      >
        <h1 className="mb-2 text-3xl font-black text-orange-300">XPLearning</h1>
        <p className="mb-5 text-sm text-slate-200">{isLogin ? 'Re-enter the arena.' : 'Create your player profile.'}</p>

        {!isLogin && (
          <input className="mb-3 w-full rounded-lg border border-white/20 bg-slate-950/40 p-3" placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        )}

        <input className="mb-3 w-full rounded-lg border border-white/20 bg-slate-950/40 p-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="mb-4 w-full rounded-lg border border-white/20 bg-slate-950/40 p-3" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

        <button className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-cyan-500 px-4 py-3 font-semibold" disabled={loading}>
          {loading ? 'Syncing...' : isLogin ? 'Login' : 'Register'}
        </button>

        <button type="button" className="mt-3 text-sm text-cyan-200 underline" onClick={() => setIsLogin((v) => !v)}>
          {isLogin ? 'New user? Register' : 'Already have account? Login'}
        </button>

        <div className="mt-4 rounded-lg border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-200">
          Demo learner: `learner@xplearning.com / learner12345`<br />
          Demo admin: `admin@xplearning.com / admin12345`
        </div>
      </motion.form>
    </div>
  );
}
