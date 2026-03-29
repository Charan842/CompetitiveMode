import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MatchView from './pages/MatchView';
import CreateTask from './pages/CreateTask';
import TaskView from './pages/TaskView';
import SubmissionPage from './pages/SubmissionPage';
import ResultsPage from './pages/ResultsPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-yellow-400" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/match/:id" element={<ProtectedRoute><MatchView /></ProtectedRoute>} />
      <Route path="/create-task/:matchId" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
      <Route path="/task/:id" element={<ProtectedRoute><TaskView /></ProtectedRoute>} />
      <Route path="/submit/:taskId/:subtaskId" element={<ProtectedRoute><SubmissionPage /></ProtectedRoute>} />
      <Route path="/results/:taskId" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900">
          <Navbar />
          <AppRoutes />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
