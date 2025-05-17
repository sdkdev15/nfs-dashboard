import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Users, Shield, Settings, LogOut, Home, Monitor } from 'lucide-react'; 
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import SystemSettings from './SystemSettings';
import MonitoringSystem from './MonitoringSystem';
import ProfileDropdown from '../ProfileDropdown';
import { User } from '@/types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  // const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 right-0 left-64 bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <ProfileDropdown user={user} onLogout={onLogout} />
        </div>
      </header>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <Shield className="h-8 w-8 text-blue-500" />
          <h1 className="ml-2 text-white font-bold">Admin Panel</h1>
        </div>
        
        <nav className="mt-6">
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800"
            onClick={() => setActiveTab('dashboard')}
          >
            <Home className="h-5 w-5 mr-3" />
            NFS Manager
          </Link>
          <Link
            to="/admin/users"
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 ${
              activeTab === 'users' ? 'bg-gray-800' : ''
            }`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="h-5 w-5 mr-3" />
            User Management
          </Link>
          
          <Link
            to="/admin/roles"
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 ${
              activeTab === 'roles' ? 'bg-gray-800' : ''
            }`}
            onClick={() => setActiveTab('roles')}
          >
            <Shield className="h-5 w-5 mr-3" />
            Role Management
          </Link>
          
          <Link
            to="/admin/settings"
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 ${
              activeTab === 'settings' ? 'bg-gray-800' : ''
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5 mr-3" />
            System Settings
          </Link>

          <Link
            to="/admin/monitoring"
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 ${
              activeTab === 'monitoring' ? 'bg-gray-800' : ''
            }`}
            onClick={() => setActiveTab('monitoring')}
          >
            <Monitor className="h-5 w-5 mr-3" />
            Monitoring System
          </Link>
        </nav>

        <div className="absolute bottom-0 w-full">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 pt-20 p-8">
        <Routes>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="roles" element={<RoleManagement />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="monitoring" element={<MonitoringSystem />} /> 
          <Route path="*" element={<Navigate to="users" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
