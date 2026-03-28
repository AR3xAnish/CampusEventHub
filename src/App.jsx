import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizerDashboard from './pages/Organizer/Dashboard';
import StudentDashboard from './pages/Student/Dashboard';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <div className="min-h-screen font-sans text-slate-100 bg-dark overflow-x-hidden selection:bg-primary/30 selection:text-white">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student/*" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/organizer/*" element={
          <ProtectedRoute allowedRole="organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App;
