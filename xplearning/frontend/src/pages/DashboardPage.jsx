import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import HUDBar from '../components/HUDBar';
import SubjectCard from '../components/SubjectCard';
import GlassCard from '../components/GlassCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const load = async () => {
    const [dashboardRes, subjectsRes] = await Promise.all([api.get('/dashboard/me'), api.get('/subjects')]);
    setDashboard(dashboardRes.data.data);
    setSubjects(subjectsRes.data.data);
  };

  useEffect(() => { load(); }, []);

  const enroll = async (subjectId) => {
    await api.post(`/subjects/${subjectId}/enroll`);
    await load();
  };

  if (!dashboard) return <p className="text-slate-200">Loading mission control...</p>;

  return (
    <div className="space-y-5">
      <HUDBar xp={dashboard.profile.totalXP} level={dashboard.profile.level} streak={dashboard.profile.streak.current} />

      <GlassCard>
        <h2 className="text-xl font-bold text-orange-200">Welcome, {dashboard.profile.fullName}</h2>
        <p className="text-sm text-slate-200">Resume your path and keep the streak alive.</p>
        {dashboard.profile.resumeTopic && (
          <button className="mt-3 rounded-lg bg-cyan-600 px-4 py-2 text-sm" onClick={() => navigate(`/topic/${dashboard.profile.resumeTopic._id}/learn`)}>
            Resume: {dashboard.profile.resumeTopic.title}
          </button>
        )}
      </GlassCard>

      <section>
        <h3 className="mb-3 text-lg font-semibold text-cyan-200">Subjects</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEnroll={() => enroll(subject.id)}
              onOpen={() => navigate(`/subject/${subject.id}`)}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard>
          <h3 className="mb-2 font-semibold text-orange-200">Recent Attempts</h3>
          <ul className="space-y-2 text-sm text-slate-200">
            {dashboard.recentAttempts.map((item) => (
              <li key={item._id} className="rounded bg-white/5 p-2">
                {item.topic?.title} | {item.accuracy}% | {item.passed ? 'Cleared' : 'Retry'}
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard>
          <h3 className="mb-2 font-semibold text-cyan-200">Performance Insights</h3>
          <p className="text-sm">Strong Zones: {dashboard.performanceInsights.strong.join(', ') || 'Keep playing to generate insights'}</p>
          <p className="mt-2 text-sm">Weak Zones: {dashboard.performanceInsights.weakAreas.map((x) => x.suggestion).join(', ') || 'No weak area flagged yet'}</p>
        </GlassCard>
      </div>
    </div>
  );
}
