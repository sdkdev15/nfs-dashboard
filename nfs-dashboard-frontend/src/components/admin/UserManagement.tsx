import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { UserPlus, Edit2, Trash2, X, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<{ email: string; password: string; roleId: string }>({ email: '', password: '', roleId: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<{ email: string; roleId: string }>({ email: '', roleId: '' });
  const [error, setError] = useState('');

  // Fetch users and roles
  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoading(true);
    Promise.all([
      fetch(`${BACKEND_URL}/api/admin/users`, { headers: { Authorization: token || '' } }).then(res => res.json()),
      fetch(`${BACKEND_URL}/api/admin/roles`, { headers: { Authorization: token || '' } }).then(res => res.json())
    ]).then(([usersData, rolesData]) => {
      // Map two_factorEnabled to twoFactorEnabled for frontend use
      const mappedUsers = usersData.map((u: any) => ({
        ...u,
        twoFactorEnabled: u.twoFactorEnabled ?? u.two_factorEnabled ?? false,
      }));
      setUsers(mappedUsers);
      setRoles(rolesData);
      setLoading(false);
    }).catch(() => {
      setError('Failed to load users or roles');
      setLoading(false);
    });
  }, []);

  // Add User
  const handleAddUser = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  const token = localStorage.getItem('token');

  try {
    const usernameFromEmail = newUser.email.split('@')[0];

    const res = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || ''
      },
      body: JSON.stringify({
        email: newUser.email,
        password: newUser.password,
        name: usernameFromEmail,
        role: {
          id: Number(newUser.roleId)
        },
        twoFactorEnabled: false,
        twoFASecret: ''
      })
    });

    if (!res.ok) throw new Error('Failed to add user');
    const created = await res.json();
    setUsers((prev) => [...prev, created]);
    setShowAddModal(false);
    setNewUser({ email: '', password: '', roleId: '' });
  } catch (err: any) {
    setError(err.message || 'Failed to add user');
  }
};


  // Edit User
  const handleEditUser = (user: User) => {
    setEditingUserId(user.id);
    setEditUser({ email: user.email, roleId: user.role?.id || '' });
    setError('');
  };

  const handleSaveEditUser = async (userId: string) => {
    setUpdatingUserId(userId);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({
          email: editUser.email,
          role: { id: editUser.roleId }
        })
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers(users =>
        users.map(user =>
          user.id === userId
            ? {
                ...user,
                email: editUser.email,
                role: roles.find(r => r.id === editUser.roleId) || user.role
              }
            : user
        )
      );
      setEditingUserId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setUpdatingUserId(userId);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: token || '' }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users => users.filter(user => user.id !== userId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Update Role (dropdown)
  const updateUserRole = async (userId: string, roleId: string) => {
    setUpdatingUserId(userId);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({ role: { id: roleId } })
      });
      if (!res.ok) throw new Error('Failed to update user role');
      setUsers(users =>
        users.map(user =>
          user.id === userId
            ? {
                ...user,
                role: roles.find(r => r.id === roleId) || user.role
              }
            : user
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full border rounded px-3 py-2"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
              />
              <select
                required
                className="w-full border rounded px-3 py-2"
                value={newUser.roleId}
                onChange={e => setNewUser({ ...newUser, roleId: e.target.value })}
              >
                <option value="" disabled>Select role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2FA Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <input
                        type="email"
                        className="border rounded px-2 py-1"
                        value={editUser.email}
                        onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                        disabled={updatingUserId === user.id}
                      />
                    ) : (
                      <div className="text-sm text-gray-900">{user.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingUserId === user.id ? (
                      <select
                        className="text-sm border-gray-300 rounded-md"
                        value={editUser.roleId}
                        onChange={e => setEditUser({ ...editUser, roleId: e.target.value })}
                        disabled={updatingUserId === user.id}
                      >
                        <option value="" disabled>Select role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        className="text-sm border-gray-300 rounded-md"
                        value={user.role?.id || ''}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        disabled={updatingUserId === user.id}
                      >
                        <option value="" disabled>Select role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.twoFactorEnabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {editingUserId === user.id ? (
                        <>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleSaveEditUser(user.id)}
                            disabled={updatingUserId === user.id}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => setEditingUserId(null)}
                            disabled={updatingUserId === user.id}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditUser(user)}
                            disabled={updatingUserId === user.id}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={updatingUserId === user.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;