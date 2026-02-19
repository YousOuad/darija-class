import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Session from './pages/Session';
import Lessons from './pages/Lessons';
import LessonView from './pages/LessonView';
import Roadmap from './pages/Roadmap';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Flashcards from './pages/Flashcards';
import Conversation from './pages/Conversation';
import CurriculumEditor from './pages/CurriculumEditor';


function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function TeacherRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'teacher' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}


export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Semi-protected (redirect to dashboard if already authenticated) */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/session" element={
        <ProtectedRoute>
          <Session />
        </ProtectedRoute>
      } />
      <Route path="/lessons" element={
        <ProtectedRoute>
          <Lessons />
        </ProtectedRoute>
      } />
      <Route path="/lesson/:id" element={
        <ProtectedRoute>
          <LessonView />
        </ProtectedRoute>
      } />
      <Route path="/roadmap" element={
        <ProtectedRoute>
          <Roadmap />
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/flashcards" element={
        <ProtectedRoute>
          <Flashcards />
        </ProtectedRoute>
      } />
      <Route path="/conversation" element={
        <ProtectedRoute>
          <Conversation />
        </ProtectedRoute>
      } />

      {/* Teacher/Admin routes */}
      <Route path="/curriculum-editor" element={
        <TeacherRoute>
          <CurriculumEditor />
        </TeacherRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
