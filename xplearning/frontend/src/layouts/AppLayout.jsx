import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive ? 'bg-xporange/30 text-white shadow-neon' : 'text-slate-200 hover:bg-white/10'}`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-xpwhite">
      <header className="sticky top-0 z-30 border-b border-white/15 bg-hud backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-black tracking-wide text-xporange">XPLearning</Link>
          {user && (
            <>
              <nav className="flex flex-wrap gap-2">
                {user.role === 'learner' && (
                  <>
                    <NavItem to="/dashboard" label="Mission Hub" />
                    <NavItem to="/leaderboard" label="Leaderboard" />
                    <NavItem to="/support" label="Support" />
                    <NavItem to="/profile" label="Profile" />
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <NavItem to="/admin" label="Dashboard" />
                    <NavItem to="/admin/subjects" label="Subjects" />
                    <NavItem to="/admin/users" label="Users" />
                    <NavItem to="/admin/tickets" label="Tickets" />
                  </>
                )}
              </nav>
              <motion.div className="flex items-center gap-2 rounded-xl border border-cyan-200/30 bg-white/10 px-3 py-2"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <span className="text-xs text-cyan-200">LVL {user.level}</span>
                <span className="text-xs font-semibold text-orange-200">XP {user.totalXP}</span>
                <button
                  className="rounded-md bg-slate-900/70 px-2 py-1 text-xs"
                  onClick={() => { logout(); navigate('/login'); }}
                >
                  Logout
                </button>
              </motion.div>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
