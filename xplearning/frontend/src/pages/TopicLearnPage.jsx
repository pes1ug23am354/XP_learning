import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

export default function TopicLearnPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    api.get(`/topics/${topicId}`).then((res) => setTopic(res.data.data));
  }, [topicId]);

  const continueToQuiz = async () => {
    await api.post(`/topics/${topicId}/read`);
    navigate(`/topic/${topicId}/quiz`);
  };

  if (!topic) return <p>Loading topic content...</p>;

  return (
    <div className="space-y-4">
      <GlassCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-orange-300">{topic.title}</h1>
            <p className="text-sm text-slate-300">Study Phase | Estimated {topic.estimatedMinutes} min</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-cyan-300/40 bg-slate-900/60 px-4 py-2 text-sm">
            Exit Map
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <p className="mb-4 text-slate-100">{topic.content.intro}</p>
        <div className="space-y-4">
          {topic.content.sections.map((section, idx) => (
            <motion.section key={section.heading} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="rounded-xl border border-white/10 bg-slate-900/30 p-4">
              <h2 className="text-lg font-semibold text-cyan-200">{section.heading}</h2>
              <p className="mt-2 text-sm text-slate-200">{section.body}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-orange-100">
                {section.keyPoints.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </motion.section>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-orange-500/10 p-3 text-sm">{topic.content.summary}</p>
        <button onClick={continueToQuiz} className="mt-4 rounded-lg bg-gradient-to-r from-orange-500 to-cyan-500 px-5 py-2 font-semibold">
          Continue To Quiz
        </button>
      </GlassCard>
    </div>
  );
}
