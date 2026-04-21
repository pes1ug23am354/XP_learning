import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import MapNode from '../components/MapNode';
import api from '../api/client';

export default function SubjectMapPage() {
  const { subjectId } = useParams();
  const [data, setData] = useState(null);
  const [challengeResult, setChallengeResult] = useState('');

  const load = async () => {
    const res = await api.get(`/subjects/${subjectId}/map`);
    setData(res.data.data);
  };

  useEffect(() => { load(); }, [subjectId]);

  const playChapterChallenge = async (chapter) => {
    const answers = chapter.chapterChallengeUnlocked ? Array(25).fill(0) : [];
    if (!answers.length) return;
    try {
      const res = await api.post(`/topics/chapter-challenge/${chapter.id}`, { answers, durationSec: 280 });
      setChallengeResult(`${chapter.title}: ${res.data.message} | XP +${res.data.data.xpAwarded}`);
      await load();
    } catch (err) {
      setChallengeResult(err.response?.data?.message || 'Challenge failed');
    }
  };

  if (!data) return <p>Loading map...</p>;

  return (
    <div className="space-y-5">
      <GlassCard>
        <h1 className="text-2xl font-black text-orange-300">{data.subject.title} - Progression Map</h1>
        <p className="text-sm text-slate-200">{data.subject.description}</p>
      </GlassCard>

      {challengeResult && <p className="rounded-lg bg-cyan-500/20 p-3 text-sm">{challengeResult}</p>}

      {data.chapters.map((chapter) => (
        <GlassCard key={chapter.id}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-cyan-200">Chapter {chapter.order}: {chapter.title}</h2>
            <button
              onClick={() => playChapterChallenge(chapter)}
              className="rounded bg-orange-600 px-3 py-1 text-xs disabled:opacity-50"
              disabled={!chapter.chapterChallengeUnlocked}
            >
              {chapter.chapterChallengeCleared ? 'Challenge Cleared' : 'Play Chapter Challenge'}
            </button>
          </div>
          <p className="mb-4 text-sm text-slate-300">{chapter.summary}</p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {chapter.topics.map((topic, idx) => <MapNode key={topic.id} topic={topic} index={idx} />)}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
