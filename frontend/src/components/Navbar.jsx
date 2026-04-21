import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">Reward Learning</div>
      {isAuthenticated && (
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/courses">Courses</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/rewards">Rewards</Link>
        </nav>
      )}
      <div className="nav-user">
        {isAuthenticated ? (
          <>
            <span>{user?.full_name} ({user?.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
