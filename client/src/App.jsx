import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/patient/Dashboard';
import PhlebotomistDashboard from './pages/phlebotomist/Dashboard';
import LabDashboard from './pages/lab/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Role-Specific Protected Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/phlebotomist/dashboard"
            element={
              <ProtectedRoute allowedRoles={['phlebotomist']}>
                <PhlebotomistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab/dashboard"
            element={
              <ProtectedRoute allowedRoles={['lab_admin']}>
                <LabDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
