import { useEffect, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [replyByTicket, setReplyByTicket] = useState({});

  const load = async () => {
    const res = await api.get('/tickets/admin/all');
    setTickets(res.data.data);
  };

  useEffect(() => { load(); }, []);

  const sendReply = async (ticketId) => {
    const reply = (replyByTicket[ticketId] || '').trim();
    if (!reply) return;
    await api.patch(`/tickets/admin/${ticketId}`, { reply, status: 'open' });
    setReplyByTicket((prev) => ({ ...prev, [ticketId]: '' }));
    await load();
  };

  const resolve = async (ticketId) => {
    await api.patch(`/tickets/admin/${ticketId}`, { status: 'resolved' });
    await load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-orange-300">Tickets Management</h1>
      <GlassCard>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="font-semibold text-orange-100">{ticket.title}</p>
              <p className="text-xs text-slate-300">{ticket.user?.fullName} | {ticket.category} | {ticket.priority} | {ticket.status}</p>

              <div className="mt-2 rounded border border-white/10 bg-slate-900/40 p-2 text-sm text-slate-100">
                <p className="text-xs font-semibold text-cyan-200">Learner Message</p>
                <p>{ticket.user_message}</p>
              </div>

              <div className="mt-2 rounded border border-white/10 bg-slate-900/40 p-2 text-sm text-slate-100">
                <p className="text-xs font-semibold text-orange-200">Admin Reply</p>
                <p>{ticket.admin_reply || 'No reply yet'}</p>
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded bg-slate-900/40 p-2 text-sm"
                  placeholder="Type admin reply"
                  disabled={ticket.status === 'resolved'}
                  value={replyByTicket[ticket._id] || ''}
                  onChange={(e) => setReplyByTicket((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                />
                <button disabled={ticket.status === 'resolved'} onClick={() => sendReply(ticket._id)} className="rounded bg-cyan-700 px-3 py-2 text-xs disabled:opacity-50">Submit Reply</button>
                <button disabled={ticket.status === 'resolved'} onClick={() => resolve(ticket._id)} className="rounded bg-emerald-600 px-3 py-2 text-xs disabled:opacity-50">Mark as Resolved</button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
