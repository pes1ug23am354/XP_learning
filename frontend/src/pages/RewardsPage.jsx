import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const defaultRule = {
  pointsPerPass: 10,
  bonusForPerfectScore: 10,
  streakBonusThreshold: 3,
  streakBonusPoints: 15,
};

export default function RewardsPage() {
  const { user, setUser } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [ruleForm, setRuleForm] = useState(defaultRule);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [catalogRes, redemptionRes, meRes] = await Promise.all([
        api.get('/rewards/catalog'),
        api.get('/rewards/my-redemptions'),
        api.get('/auth/me'),
      ]);
      setCatalog(catalogRes.data.data);
      setMyRedemptions(redemptionRes.data.data);
      setUser(meRes.data.data);

      if (meRes.data.data.role === 'admin') {
        const configRes = await api.get('/rewards/config');
        setRuleForm({
          pointsPerPass: configRes.data.data.points_per_pass,
          bonusForPerfectScore: configRes.data.data.bonus_for_perfect_score,
          streakBonusThreshold: configRes.data.data.streak_bonus_threshold,
          streakBonusPoints: configRes.data.data.streak_bonus_points,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rewards');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (rewardId) => {
    try {
      await api.post(`/rewards/redeem/${rewardId}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Redeem failed');
    }
  };

  const handleUpdateRule = async (e) => {
    e.preventDefault();
    try {
      await api.put('/rewards/config', {
        pointsPerPass: Number(ruleForm.pointsPerPass),
        bonusForPerfectScore: Number(ruleForm.bonusForPerfectScore),
        streakBonusThreshold: Number(ruleForm.streakBonusThreshold),
        streakBonusPoints: Number(ruleForm.streakBonusPoints),
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Reward rule update failed');
    }
  };

  return (
    <section>
      <h1>Rewards</h1>
      <p>Available Points: {user?.points_balance ?? 0}</p>
      {error && <p className="error">{error}</p>}

      <h2>Reward Catalog</h2>
      <div className="card-grid">
        {catalog.map((reward) => (
          <article className="card" key={reward.id}>
            <h3>{reward.title}</h3>
            <p>{reward.description}</p>
            <p>Cost: {reward.points_cost} points</p>
            <p>Stock: {reward.stock}</p>
            <button onClick={() => handleRedeem(reward.id)} disabled={reward.stock <= 0}>Redeem</button>
          </article>
        ))}
      </div>

      <h2>My Redemptions</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reward</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myRedemptions.map((r) => (
              <tr key={r.id}>
                <td>{r.reward_title}</td>
                <td>{r.points_spent}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {user?.role === 'admin' && (
        <form className="form-card" onSubmit={handleUpdateRule}>
          <h2>Admin: Reward Configuration</h2>
          <input type="number" value={ruleForm.pointsPerPass} onChange={(e) => setRuleForm({ ...ruleForm, pointsPerPass: e.target.value })} placeholder="Points per pass" required />
          <input type="number" value={ruleForm.bonusForPerfectScore} onChange={(e) => setRuleForm({ ...ruleForm, bonusForPerfectScore: e.target.value })} placeholder="Perfect score bonus" required />
          <input type="number" value={ruleForm.streakBonusThreshold} onChange={(e) => setRuleForm({ ...ruleForm, streakBonusThreshold: e.target.value })} placeholder="Streak threshold" required />
          <input type="number" value={ruleForm.streakBonusPoints} onChange={(e) => setRuleForm({ ...ruleForm, streakBonusPoints: e.target.value })} placeholder="Streak bonus points" required />
          <button type="submit">Update Reward Rule</button>
        </form>
      )}
    </section>
  );
}
