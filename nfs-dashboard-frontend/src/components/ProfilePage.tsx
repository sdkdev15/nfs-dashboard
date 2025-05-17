import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { Settings, Smartphone, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ name?: string; email?: string }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/api/auth/profile`, {
      headers: { Authorization: token || '' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setForm({ name: data.name, email: data.email });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Optionally, implement profile update if your backend supports it
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      setSuccess('Profile updated successfully.');
    } catch {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!profile) return <div className="p-8 text-red-600">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex items-center justify-center h-16 bg-gray-800">
          <Settings className="h-8 w-8 text-blue-500" />
          <h1 className="ml-2 text-white font-bold">Profile</h1>
        </div>
        <nav className="mt-6">
          <Link
            to="/"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800"
          >
            <Home className="h-5 w-5 mr-3" />
            NFS Manager
          </Link>
          <Link
            to="/profile"
            className="flex items-center px-6 py-3 text-gray-300 bg-gray-800"
          >
            <Settings className="h-5 w-5 mr-3" />
            Profile Settings
          </Link>
          <Link
            to="/2fa-setup"
            className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800"
          >
            <Smartphone className="h-5 w-5 mr-3" />
            {profile.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
          </Link>
        </nav>
      </div>

      {/* Main content */}
      <div className="ml-64 pt-20 p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">My Profile</h2>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}
        <div className="bg-white rounded shadow p-8">
          {!editMode ? (
            <div>
              <div className="mb-4">
                <label className="block text-gray-600">Name</label>
                <div className="text-gray-900">{profile.name || '-'}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">Email</label>
                <div className="text-gray-900">{profile.email}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">Role</label>
                <div className="text-gray-900">{profile.role?.name || '-'}</div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">2FA Status</label>
                <div className="text-gray-900">
                  {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-1" htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email || ''}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  disabled
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;