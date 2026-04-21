import { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import api from '../api/client';

export default function LeaderboardPage() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/leaderboard').then((res) => setRows(res.data.data));
  }, []);

  return (
    <GlassCard>
      <h1 className="mb-4 text-2xl font-black text-orange-300">Global XP Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-cyan-200">
              <th className="p-2">Rank</th><th className="p-2">Player</th><th className="p-2">XP</th><th className="p-2">Level</th><th className="p-2">Streak</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="p-2">#{row.rank}</td>
                <td className="p-2">{row.fullName}</td>
                <td className="p-2">{row.totalXP}</td>
                <td className="p-2">{row.level}</td>
                <td className="p-2">{row.streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
