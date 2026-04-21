import { useEffect, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'bug', priority: 'medium', message: '' });

  const load = async () => {
    const res = await api.get('/tickets/me');
    setTickets(res.data.data);
  };

  useEffect(() => { load(); }, []);

  const createTicket = async (e) => {
    e.preventDefault();
    await api.post('/tickets', form);
    setForm({ title: '', category: 'bug', priority: 'medium', message: '' });
    await load();
  };

  return (
    <div className="space-y-4">
      <GlassCard>
        <h2 className="mb-3 text-lg font-bold text-orange-200">Raise Support Ticket</h2>
        <form className="grid gap-2" onSubmit={createTicket}>
          <input className="rounded bg-slate-900/40 p-2" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-2">
            <select className="rounded bg-slate-900/40 p-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="bug">Bug</option><option value="content">Content</option><option value="account">Account</option><option value="other">Other</option>
            </select>
            <select className="rounded bg-slate-900/40 p-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
          <textarea className="rounded bg-slate-900/40 p-2" placeholder="Describe your issue" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <button className="rounded bg-cyan-600 px-3 py-2">Submit Ticket</button>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-3 text-lg font-bold text-cyan-200">My Tickets</h2>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-orange-100">{ticket.title}</p>
              <p className="text-xs text-slate-300">{ticket.category} | {ticket.priority} | {ticket.status}</p>
              <div className="mt-2 rounded border border-white/10 bg-slate-900/40 p-2 text-sm text-slate-100">
                <p className="text-xs font-semibold text-cyan-200">Your Message</p>
                <p>{ticket.user_message}</p>
              </div>
              <div className="mt-2 rounded border border-white/10 bg-slate-900/40 p-2 text-sm text-slate-100">
                <p className="text-xs font-semibold text-orange-200">Admin Reply</p>
                <p>{ticket.admin_reply || 'No reply yet'}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
