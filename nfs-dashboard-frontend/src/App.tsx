import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import FileManager from './components/FileManager';
import AdminDashboard from './components/admin/AdminDashboard';
import { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(() => {
    // Mock user for prototype
    return {
      id: '1',
      email: 'admin@example.com',
      role: {
        id: '1',
        name: 'admin',
        permissions: [
          { action: 'admin', resource: '*' }
        ]
      },
      twoFactorEnabled: false
    };
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <LoginForm onLogin={setUser} />
        } />
        <Route path="/admin/*" element={
          user?.role.name === 'admin' ? <AdminDashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />
        } />
        <Route path="/*" element={
          user ? <FileManager user={user} /> : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;