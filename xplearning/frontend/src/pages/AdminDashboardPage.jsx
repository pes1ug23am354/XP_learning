import { useEffect, useState } from 'react';
import api from '../api/client';
import GlassCard from '../components/GlassCard';

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then((res) => setAnalytics(res.data.data));
  }, []);

  if (!analytics) return <p>Loading admin stats...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-orange-300">Admin Dashboard</h1>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Total Users" value={analytics.totalUsers} />
        <Metric label="Learners" value={analytics.learners} />
        <Metric label="Subjects" value={analytics.subjects} />
        <Metric label="Chapters" value={analytics.chapters} />
        <Metric label="Topics" value={analytics.topics} />
        <Metric label="Completion %" value={analytics.topicCompletionRate} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <GlassCard className="text-center">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="text-2xl font-black text-orange-200">{value}</p>
    </GlassCard>
  );
}
