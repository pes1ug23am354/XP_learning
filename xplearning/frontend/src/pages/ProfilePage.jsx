import { useEffect, useState } from 'react';
import api from '../api/client';
import HUDBar from '../components/HUDBar';
import GlassCard from '../components/GlassCard';

export default function ProfilePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/me').then((res) => setData(res.data.data));
  }, []);

  if (!data) return <p>Loading profile...</p>;

  return (
    <div className="space-y-4">
      <HUDBar xp={data.profile.totalXP} level={data.profile.level} streak={data.profile.streak.current} />
      <GlassCard>
        <h1 className="text-2xl font-black text-orange-300">Player Profile</h1>
        <p className="text-sm text-slate-300">{data.profile.fullName} | {data.profile.email}</p>
      </GlassCard>
      <GlassCard>
        <h2 className="mb-3 text-lg font-semibold text-cyan-200">Enrolled Subjects Analytics</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {data.enrolled.map((item) => (
            <div key={item.subjectId} className="rounded border border-white/10 bg-slate-900/40 p-3 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p>Accuracy: {item.accuracy}%</p>
              <p>Questions Attempted: {item.attemptedQuestions}</p>
              <p>Completed Topics: {item.completedTopics}</p>
              <p>Completed Chapters: {item.completedChapters}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
