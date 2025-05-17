import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import FileManager from './components/FileManager';
import AdminDashboard from './components/admin/AdminDashboard';
import TwoFactorSetup from './components/auth/TwoFactorSetup';
import ProfilePage from './components/ProfilePage';
import { User } from './types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for token and fetch profile
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: token }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />
        } />
        <Route path="/admin/*" element={
          user?.role?.name === 'admin'
            ? <AdminDashboard user={user} onLogout={handleLogout} />
            : <Navigate to="/login" />
        } />
        <Route path="/2fa-setup" element={
          user ? <TwoFactorSetup user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/*" element={
          user ? <FileManager user={user} /> : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;