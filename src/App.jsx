import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Projects from './pages/Projects';
import ProjectMembers from './pages/ProjectMembers';
import Permissions from './pages/Permissions';
import Forms from './pages/Forms';
import Sectors from './pages/Sectors';
import CreateSector from './pages/CreateSector';
import Tasks from './pages/Tasks';
import Monitoring from './pages/Monitoring';
import Survey from './pages/Survey';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={
          user?.role === 'ENUMERATOR' ? <Navigate to="/survey" replace /> : <Dashboard />
        } />
        <Route path="/companies" element={<Companies />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/members" element={<ProjectMembers />} />
        <Route path="/permissions" element={<Permissions />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/sectors" element={<Sectors />} />
        <Route path="/sectors/new" element={<CreateSector />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/survey" element={<Survey />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
