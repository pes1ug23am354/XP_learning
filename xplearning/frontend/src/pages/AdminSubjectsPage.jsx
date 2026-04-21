import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

const defaultContent = {
  intro: 'Topic intro',
  sections: [
    { heading: 'Core Concept', body: 'Explain the concept clearly.', keyPoints: ['Point 1', 'Point 2', 'Point 3'] },
  ],
  summary: 'Topic summary',
};

const emptyQuestion = () => ({ id: '', prompt: '', options: ['', '', '', ''], answerIndex: 0, explanation: '' });

export default function AdminSubjectsPage() {
  const [tree, setTree] = useState([]);
  const [subject, setSubject] = useState({ title: '', board: 'CBSE', classLevel: 'Class 10', description: '' });
  const [chapter, setChapter] = useState({ subjectId: '', title: '', order: 1, summary: '' });
  const [topic, setTopic] = useState({ chapterId: '', title: '', order: 1, content: JSON.stringify(defaultContent, null, 2) });
  const [questions, setQuestions] = useState(Array.from({ length: 15 }, (_, i) => ({ ...emptyQuestion(), id: `q${i + 1}` })));

  const loadTree = async () => {
    const res = await api.get('/admin/content-tree');
    setTree(res.data.data);
  };

  useEffect(() => { loadTree(); }, []);

  const chapterOptions = useMemo(() => tree.flatMap((s) => s.chapters.map((c) => ({ id: c.id, label: `${s.title} > ${c.title}` }))), [tree]);

  const createSubject = async (e) => {
    e.preventDefault();
    await api.post('/admin/subjects', subject);
    setSubject({ title: '', board: 'CBSE', classLevel: 'Class 10', description: '' });
    await loadTree();
  };

  const createChapter = async (e) => {
    e.preventDefault();
    await api.post('/admin/chapters', { ...chapter, subjectId: Number(chapter.subjectId), order: Number(chapter.order) });
    setChapter({ subjectId: '', title: '', order: 1, summary: '' });
    await loadTree();
  };

  const createTopic = async (e) => {
    e.preventDefault();
    const valid = questions.filter((q) => q.prompt.trim() && q.options.every((opt) => opt.trim()));
    if (valid.length < 15) {
      alert('Please provide at least 15 complete MCQs.');
      return;
    }
    await api.post('/admin/topics', {
      chapterId: Number(topic.chapterId),
      title: topic.title,
      order: Number(topic.order),
      content: JSON.parse(topic.content),
      quiz: { questions: valid, passScore: 60, xpBase: 120 },
    });
    setTopic({ chapterId: '', title: '', order: 1, content: JSON.stringify(defaultContent, null, 2) });
    setQuestions(Array.from({ length: 15 }, (_, i) => ({ ...emptyQuestion(), id: `q${i + 1}` })));
    await loadTree();
  };

  const updateQuestion = (idx, patch) => setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const addQuestion = () => setQuestions((prev) => [...prev, { ...emptyQuestion(), id: `q${prev.length + 1}` }]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-orange-300">Subjects Management</h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard>
          <h2 className="mb-2 text-lg font-bold text-cyan-200">Add Subject</h2>
          <form className="grid gap-2" onSubmit={createSubject}>
            <input className="rounded bg-slate-900/40 p-2" placeholder="Title" value={subject.title} onChange={(e) => setSubject({ ...subject, title: e.target.value })} required />
            <input className="rounded bg-slate-900/40 p-2" placeholder="Board" value={subject.board} onChange={(e) => setSubject({ ...subject, board: e.target.value })} required />
            <input className="rounded bg-slate-900/40 p-2" placeholder="Class Level" value={subject.classLevel} onChange={(e) => setSubject({ ...subject, classLevel: e.target.value })} required />
            <textarea className="rounded bg-slate-900/40 p-2" placeholder="Description" value={subject.description} onChange={(e) => setSubject({ ...subject, description: e.target.value })} required />
            <button className="rounded bg-orange-500 px-3 py-2">Create Subject</button>
          </form>
        </GlassCard>

        <GlassCard>
          <h2 className="mb-2 text-lg font-bold text-cyan-200">Add Chapter</h2>
          <form className="grid gap-2" onSubmit={createChapter}>
            <select className="rounded bg-slate-900/40 p-2" value={chapter.subjectId} onChange={(e) => setChapter({ ...chapter, subjectId: e.target.value })} required>
              <option value="">Select Subject</option>
              {tree.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <input className="rounded bg-slate-900/40 p-2" placeholder="Chapter title" value={chapter.title} onChange={(e) => setChapter({ ...chapter, title: e.target.value })} required />
            <input type="number" className="rounded bg-slate-900/40 p-2" placeholder="Order" value={chapter.order} onChange={(e) => setChapter({ ...chapter, order: e.target.value })} required />
            <textarea className="rounded bg-slate-900/40 p-2" placeholder="Summary" value={chapter.summary} onChange={(e) => setChapter({ ...chapter, summary: e.target.value })} required />
            <button className="rounded bg-cyan-700 px-3 py-2">Create Chapter</button>
          </form>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="mb-2 text-lg font-bold text-cyan-200">Add Topic + MCQs (min 15)</h2>
        <form className="grid gap-3" onSubmit={createTopic}>
          <select className="rounded bg-slate-900/40 p-2" value={topic.chapterId} onChange={(e) => setTopic({ ...topic, chapterId: e.target.value })} required>
            <option value="">Select Chapter</option>
            {chapterOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <input className="rounded bg-slate-900/40 p-2" placeholder="Topic title" value={topic.title} onChange={(e) => setTopic({ ...topic, title: e.target.value })} required />
          <input type="number" className="rounded bg-slate-900/40 p-2" placeholder="Order" value={topic.order} onChange={(e) => setTopic({ ...topic, order: e.target.value })} required />
          <textarea rows={8} className="rounded bg-slate-900/40 p-2 font-mono text-xs" value={topic.content} onChange={(e) => setTopic({ ...topic, content: e.target.value })} />

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded border border-white/10 bg-slate-900/40 p-3">
                <p className="mb-2 text-sm font-semibold text-orange-200">MCQ {idx + 1}</p>
                <input className="mb-2 w-full rounded bg-slate-800/70 p-2 text-sm" placeholder="Question" value={q.prompt} onChange={(e) => updateQuestion(idx, { prompt: e.target.value })} />
                <div className="grid gap-2 md:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <input key={`${q.id}-opt-${oi}`} className="rounded bg-slate-800/70 p-2 text-sm" placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => updateQuestion(idx, { options: q.options.map((x, xIdx) => xIdx === oi ? e.target.value : x) })} />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-slate-300">Correct Option</label>
                  <select className="rounded bg-slate-800/70 p-1 text-xs" value={q.answerIndex} onChange={(e) => updateQuestion(idx, { answerIndex: Number(e.target.value) })}>
                    <option value={0}>1</option><option value={1}>2</option><option value={2}>3</option><option value={3}>4</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={addQuestion} className="rounded border border-cyan-300/50 px-3 py-2 text-sm">Add Another MCQ</button>
            <button className="rounded bg-orange-500 px-3 py-2 text-sm">Create Topic</button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
