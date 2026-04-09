import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UsageInput from './pages/UsageInput';
import UsageHistory from './pages/UsageHistory';
import Dashboard from './pages/Dashboard';
import Bills from './pages/Bills';
import BillDetails from './pages/BillDetails';
import Suggestions from './pages/Suggestions';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import LoginSuccess from './pages/LoginSuccess';
import Landing from './pages/Landing';
import Insights from './pages/Insights';
import SplashScreen from './components/SplashScreen';
import { useState } from 'react';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} />;
  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen text-white">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/usage" 
              element={
                <ProtectedRoute>
                  <UsageInput />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <UsageHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bills" 
              element={
                <ProtectedRoute>
                  <Bills />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/bills/:id" 
              element={
                <ProtectedRoute>
                  <BillDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/suggestions" 
              element={
                <ProtectedRoute>
                  <Suggestions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alerts" 
              element={
                <ProtectedRoute>
                  <Alerts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
