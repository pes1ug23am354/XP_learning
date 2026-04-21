import { useEffect, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data.data);
  };

  useEffect(() => { load(); }, []);

  const promoteToAdmin = async (userId) => {
    await api.patch(`/admin/users/${userId}/role`, { role: 'admin' });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-orange-300">Users Management</h1>
      <GlassCard>
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="rounded border border-white/10 bg-white/5 p-3 text-sm">
              <p className="font-semibold">{u.fullName} ({u.role})</p>
              <p className="text-xs text-slate-300">XP {u.totalXP} | Level {u.level} | Accuracy {u.avgAccuracy}%</p>
              <p className="text-xs text-slate-400">Questions: {u.correctQuestions}/{u.attemptedQuestions}</p>
              {u.role !== 'admin' && <button onClick={() => promoteToAdmin(u._id)} className="mt-2 rounded bg-orange-500 px-2 py-1 text-xs">Promote to Admin</button>}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
