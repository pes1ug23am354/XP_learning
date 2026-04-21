import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProgressTracker from '../components/ProgressTracker';

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [users, setUsers] = useState([]);
  const [rewardConfig, setRewardConfig] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [meRes, progressRes, attemptsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/users/me/progress'),
        api.get('/tasks/my-attempts'),
      ]);
      setUser(meRes.data.data);
      setProgress(progressRes.data.data);
      setAttempts(attemptsRes.data.data);

      if (meRes.data.data.role === 'admin') {
        const [usersRes, ruleRes] = await Promise.all([api.get('/users'), api.get('/rewards/config')]);
        setUsers(usersRes.data.data);
        setRewardConfig(ruleRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section>
      <h1>Dashboard</h1>
      {error && <p className="error">{error}</p>}
      <div className="stats-row">
        <article className="stat-card">
          <h3>User</h3>
          <p>{user?.full_name}</p>
        </article>
        <article className="stat-card">
          <h3>Role</h3>
          <p>{user?.role}</p>
        </article>
        <article className="stat-card">
          <h3>Points Balance</h3>
          <p>{user?.points_balance ?? 0}</p>
        </article>
      </div>

      <h2>My Progress</h2>
      <ProgressTracker progressList={progress} />

      <h2>Recent Attempts</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Score</th>
              <th>Passed</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.task_title}</td>
                <td>{a.score}</td>
                <td>{a.passed ? 'Yes' : 'No'}</td>
                <td>{a.points_awarded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user?.role === 'admin' && (
        <>
          <h2>Admin: Users</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Points</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.points_balance}</td>
                    <td>{u.is_active ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rewardConfig && (
            <article className="card">
              <h3>Active Reward Rule</h3>
              <p>Base points per pass: {rewardConfig.points_per_pass}</p>
              <p>Perfect score bonus: {rewardConfig.bonus_for_perfect_score}</p>
              <p>Streak bonus: +{rewardConfig.streak_bonus_points} after {rewardConfig.streak_bonus_threshold} passes</p>
            </article>
          )}
        </>
      )}
    </section>
  );
}
