import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SubjectMapPage from './pages/SubjectMapPage';
import TopicLearnPage from './pages/TopicLearnPage';
import TopicQuizPage from './pages/TopicQuizPage';
import LeaderboardPage from './pages/LeaderboardPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminSubjectsPage from './pages/AdminSubjectsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTicketsPage from './pages/AdminTicketsPage';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function LearnerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'learner' ? children : <Navigate to="/admin" replace />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AppLayout>
              <Routes>
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/subjects" element={<AdminRoute><AdminSubjectsPage /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
                <Route path="/admin/tickets" element={<AdminRoute><AdminTicketsPage /></AdminRoute>} />

                <Route path="/dashboard" element={<LearnerRoute><DashboardPage /></LearnerRoute>} />
                <Route path="/subject/:subjectId" element={<LearnerRoute><SubjectMapPage /></LearnerRoute>} />
                <Route path="/topic/:topicId/learn" element={<LearnerRoute><TopicLearnPage /></LearnerRoute>} />
                <Route path="/topic/:topicId/quiz" element={<LearnerRoute><TopicQuizPage /></LearnerRoute>} />
                <Route path="/leaderboard" element={<LearnerRoute><LeaderboardPage /></LearnerRoute>} />
                <Route path="/support" element={<LearnerRoute><SupportPage /></LearnerRoute>} />
                <Route path="/profile" element={<LearnerRoute><ProfilePage /></LearnerRoute>} />

                <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
              </Routes>
            </AppLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
