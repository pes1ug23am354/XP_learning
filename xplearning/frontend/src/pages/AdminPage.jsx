import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

const defaultContent = {
  intro: 'Topic intro here',
  sections: [
    { heading: 'Core Concept', body: 'Explain core concept', keyPoints: ['Point 1', 'Point 2', 'Point 3'] },
  ],
  summary: 'Topic summary',
};

const sampleQuestionBank = Array.from({ length: 45 }).map((_, i) => ({
  id: `custom-q${i + 1}`,
  prompt: `Question ${i + 1}: Add exam-level prompt here.`,
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  answerIndex: 0,
  explanation: 'Why option A is correct.',
}));

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [tree, setTree] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [subject, setSubject] = useState({ title: '', board: 'CBSE', classLevel: 'Class 10', description: '' });
  const [chapter, setChapter] = useState({ subjectId: '', title: '', order: 1, summary: '' });
  const [topic, setTopic] = useState({ chapterId: '', title: '', order: 1, content: JSON.stringify(defaultContent, null, 2), questions: JSON.stringify(sampleQuestionBank, null, 2) });
  const [questionBankTopicId, setQuestionBankTopicId] = useState('');
  const [questionBankRaw, setQuestionBankRaw] = useState(JSON.stringify(sampleQuestionBank, null, 2));
  const [ticketReply, setTicketReply] = useState({});
  const [statusByTicket, setStatusByTicket] = useState({});
  const [error, setError] = useState('');

  const chapterOptions = useMemo(() => tree.flatMap((s) => s.chapters.map((c) => ({ id: c.id, label: `${s.title} > ${c.title}` }))), [tree]);
  const topicOptions = useMemo(() => tree.flatMap((s) => s.chapters.flatMap((c) => c.topics.map((t) => ({ id: t.id, label: `${s.title} > ${c.title} > ${t.title} (${t.bank_size})` })))), [tree]);

  const loadAll = async () => {
    try {
      const [analyticsRes, usersRes, treeRes, ticketsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/content-tree'),
        api.get('/tickets/admin/all'),
      ]);
      setAnalytics(analyticsRes.data.data);
      setUsers(usersRes.data.data);
      setTree(treeRes.data.data);
      setTickets(ticketsRes.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
    }
  };

  useEffect(() => { loadAll(); }, []);

  const createSubject = async (e) => {
    e.preventDefault();
    await api.post('/admin/subjects', subject);
    setSubject({ title: '', board: 'CBSE', classLevel: 'Class 10', description: '' });
    await loadAll();
  };

  const createChapter = async (e) => {
    e.preventDefault();
    await api.post('/admin/chapters', { ...chapter, order: Number(chapter.order), subjectId: Number(chapter.subjectId) });
    setChapter({ subjectId: '', title: '', order: 1, summary: '' });
    await loadAll();
  };

  const createTopic = async (e) => {
    e.preventDefault();
    const parsedQuestions = JSON.parse(topic.questions);
    const payload = {
      chapterId: Number(topic.chapterId),
      title: topic.title,
      order: Number(topic.order),
      content: JSON.parse(topic.content),
      quiz: { questions: parsedQuestions, passScore: 60, xpBase: 120 },
    };
    await api.post('/admin/topics', payload);
    setTopic({ chapterId: '', title: '', order: 1, content: JSON.stringify(defaultContent, null, 2), questions: JSON.stringify(sampleQuestionBank, null, 2) });
    await loadAll();
  };

  const updateQuestionBank = async (e) => {
    e.preventDefault();
    if (!questionBankTopicId) return;
    await api.put(`/admin/topics/${questionBankTopicId}/questions`, {
      questions: JSON.parse(questionBankRaw),
      passScore: 60,
      xpBase: 120,
    });
    await loadAll();
  };

  const promoteToAdmin = async (userId) => {
    await api.patch(`/admin/users/${userId}/role`, { role: 'admin' });
    await loadAll();
  };

  const setTicketStatus = async (ticketId, status) => {
    await api.patch(`/tickets/admin/${ticketId}`, { status });
    await loadAll();
  };

  const sendTicketReply = async (ticketId) => {
    const message = ticketReply[ticketId]?.trim();
    if (!message) return;
    const status = statusByTicket[ticketId] || 'in_progress';
    await api.patch(`/tickets/admin/${ticketId}`, { status, message });
    setTicketReply((prev) => ({ ...prev, [ticketId]: '' }));
    await loadAll();
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded bg-red-500/20 p-2 text-sm text-red-100">{error}</p>}

      {analytics && (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Metric label="Total Users" value={analytics.totalUsers} />
          <Metric label="Learners" value={analytics.learners} />
          <Metric label="Subjects" value={analytics.subjects} />
          <Metric label="Chapters" value={analytics.chapters} />
          <Metric label="Topics" value={analytics.topics} />
          <Metric label="Completion %" value={analytics.topicCompletionRate} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 text-lg font-bold text-orange-200">Content Management: Subject</h2>
          <form className="grid gap-2" onSubmit={createSubject}>
            <input className="rounded bg-slate-900/40 p-2" placeholder="Subject title" value={subject.title} onChange={(e) => setSubject({ ...subject, title: e.target.value })} required />
            <input className="rounded bg-slate-900/40 p-2" placeholder="Board" value={subject.board} onChange={(e) => setSubject({ ...subject, board: e.target.value })} required />
            <input className="rounded bg-slate-900/40 p-2" placeholder="Class Level" value={subject.classLevel} onChange={(e) => setSubject({ ...subject, classLevel: e.target.value })} required />
            <textarea className="rounded bg-slate-900/40 p-2" placeholder="Description" value={subject.description} onChange={(e) => setSubject({ ...subject, description: e.target.value })} required />
            <button className="rounded bg-cyan-700 px-3 py-2">Create Subject</button>
          </form>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-lg font-bold text-cyan-200">Content Management: Chapter</h2>
          <form className="grid gap-2" onSubmit={createChapter}>
            <select className="rounded bg-slate-900/40 p-2" value={chapter.subjectId} onChange={(e) => setChapter({ ...chapter, subjectId: e.target.value })} required>
              <option value="">Select Subject</option>
              {tree.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <input className="rounded bg-slate-900/40 p-2" placeholder="Chapter title" value={chapter.title} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} required />
            <input type="number" className="rounded bg-slate-900/40 p-2" placeholder="Order" value={chapter.order} onChange={(e) => setChapter({ ...chapter, order: e.target.value })} required />
            <textarea className="rounded bg-slate-900/40 p-2" placeholder="Summary" value={chapter.summary} onChange={(e) => setChapter({ ...chapter, summary: e.target.value })} required />
            <button className="rounded bg-orange-600 px-3 py-2">Create Chapter</button>
          </form>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="mb-3 text-lg font-bold text-orange-200">Content Management: Topic + Full Question Bank (min 45)</h2>
        <form className="grid gap-2" onSubmit={createTopic}>
          <select className="rounded bg-slate-900/40 p-2" value={topic.chapterId} onChange={(e) => setTopic({ ...topic, chapterId: e.target.value })} required>
            <option value="">Select Chapter</option>
            {chapterOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input className="rounded bg-slate-900/40 p-2" placeholder="Topic title" value={topic.title} onChange={(e) => setTopic({ ...topic, title: e.target.value })} required />
          <input type="number" className="rounded bg-slate-900/40 p-2" placeholder="Order" value={topic.order} onChange={(e) => setTopic({ ...topic, order: e.target.value })} required />
          <textarea rows={8} className="rounded bg-slate-900/40 p-2 font-mono text-xs" value={topic.content} onChange={(e) => setTopic({ ...topic, content: e.target.value })} />
          <textarea rows={10} className="rounded bg-slate-900/40 p-2 font-mono text-xs" value={topic.questions} onChange={(e) => setTopic({ ...topic, questions: e.target.value })} />
          <button className="rounded bg-cyan-700 px-3 py-2">Create Topic</button>
        </form>
      </GlassCard>

      <GlassCard>
        <h2 className="mb-3 text-lg font-bold text-cyan-200">Manage Existing Question Bank</h2>
        <form className="grid gap-2" onSubmit={updateQuestionBank}>
          <select className="rounded bg-slate-900/40 p-2" value={questionBankTopicId} onChange={(e) => setQuestionBankTopicId(e.target.value)} required>
            <option value="">Select Topic</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <textarea rows={10} className="rounded bg-slate-900/40 p-2 font-mono text-xs" value={questionBankRaw} onChange={(e) => setQuestionBankRaw(e.target.value)} />
          <button className="rounded bg-orange-600 px-3 py-2">Update Question Bank</button>
        </form>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-3 text-lg font-bold text-cyan-200">User Management + Progress</h2>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div key={u._id} className="rounded border border-white/10 bg-white/5 p-2 text-sm">
                <p className="font-semibold">{u.fullName} ({u.role})</p>
                <p className="text-xs text-slate-300">XP {u.totalXP} | Level {u.level} | Accuracy {u.avgAccuracy}%</p>
                <p className="text-xs text-slate-400">Questions: {u.correctQuestions}/{u.attemptedQuestions}</p>
                {u.role !== 'admin' && <button onClick={() => promoteToAdmin(u._id)} className="mt-2 rounded bg-orange-500 px-2 py-1 text-xs">Promote to Admin</button>}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-3 text-lg font-bold text-orange-200">Ticket Management</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-semibold text-orange-100">{ticket.title}</p>
                <p className="text-xs text-slate-300">{ticket.user?.fullName || 'Learner'} | {ticket.category} | {ticket.priority} | {ticket.status}</p>

                <div className="mt-2 space-y-1 rounded border border-white/10 bg-slate-900/40 p-2">
                  {ticket.messages?.map((msg) => (
                    <div key={msg.id || `${msg.sender_name}-${msg.created_at}`} className="rounded bg-white/5 p-2 text-xs">
                      <p className="font-semibold text-cyan-200">{msg.sender_name} ({msg.sender_role})</p>
                      <p className="text-slate-100">{msg.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex gap-2">
                  <select
                    className="rounded bg-slate-900/60 p-2 text-xs"
                    value={statusByTicket[ticket._id] || ticket.status}
                    onChange={(e) => setStatusByTicket((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button onClick={() => setTicketStatus(ticket._id, statusByTicket[ticket._id] || ticket.status)} className="rounded bg-cyan-700 px-2 py-1 text-xs">Update Status</button>
                  <button onClick={() => setTicketStatus(ticket._id, 'resolved')} className="rounded bg-emerald-600 px-2 py-1 text-xs">Mark as Resolved</button>
                </div>

                <div className="mt-2 flex gap-2">
                  <input
                    className="flex-1 rounded bg-slate-900/40 p-2 text-xs"
                    placeholder="Reply to ticket"
                    value={ticketReply[ticket._id] || ''}
                    onChange={(e) => setTicketReply((prev) => ({ ...prev, [ticket._id]: e.target.value }))}
                  />
                  <button onClick={() => sendTicketReply(ticket._id)} className="rounded bg-orange-500 px-2 py-1 text-xs">Reply</button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="text-xl font-black text-orange-200">{value}</p>
    </div>
  );
}
