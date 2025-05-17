import React, { useEffect, useState } from 'react';
import { UserRole, Permission } from '../../types';
import { Shield, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const defaultPermission: Permission = { action: 'read', resource: '/' };

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [editPermissions, setEditPermissions] = useState<Permission[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/admin/roles`, {
        headers: { Authorization: token || '' }
      });
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = () => {
    setIsAddingRole(true);
    setNewRoleName('');
    setEditPermissions([defaultPermission]);
    setError('');
  };

  const handleSaveNewRole = async () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }
    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      setError('Role name already exists');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/admin/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({
          name: newRoleName,
          permissions: editPermissions.map(p => `${p.action}:${p.resource}`)
        })
      });
      if (!res.ok) throw new Error('Failed to add role');
      await fetchRoles();
      setIsAddingRole(false);
      setNewRoleName('');
      setEditPermissions([]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to add role');
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = (role: UserRole) => {
    setEditingRoleId(role.id);
    setNewRoleName(role.name);
    setEditPermissions(role.permissions ? [...role.permissions] : []);
    setError('');
  };

  const handleSaveEdit = async (roleId: string) => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }
    if (roles.some(role => role.id !== roleId && role.name.toLowerCase() === newRoleName.toLowerCase())) {
      setError('Role name already exists');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token || ''
        },
        body: JSON.stringify({
          name: newRoleName,
          permissions: editPermissions.map(p => `${p.action}:${p.resource}`)
        })
      });
      if (!res.ok) throw new Error('Failed to update role');
      await fetchRoles();
      setEditingRoleId(null);
      setNewRoleName('');
      setEditPermissions([]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (roles.length <= 1) {
      setError('Cannot delete the last role');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: { Authorization: token || '' }
      });
      if (!res.ok) throw new Error('Failed to delete role');
      await fetchRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setNewRoleName('');
    setEditPermissions([]);
    setError('');
  };

  // Permission CRUD
  const handlePermissionChange = (idx: number, field: keyof Permission, value: string) => {
    setEditPermissions(perms =>
      perms.map((perm, i) => (i === idx ? { ...perm, [field]: value } : perm))
    );
  };

  const handleAddPermission = () => {
    setEditPermissions(perms => [...perms, { action: 'read', resource: '' }]);
  };

  const handleRemovePermission = (idx: number) => {
    setEditPermissions(perms => perms.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
        <button
          onClick={handleAddRole}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={saving}
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Role
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading roles...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(isAddingRole || editingRoleId) && (
            <div className="bg-white rounded-lg shadow p-6 border-2 border-blue-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-2" />
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Enter role name"
                    className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                    autoFocus
                    disabled={saving}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={isAddingRole ? handleSaveNewRole : () => handleSaveEdit(editingRoleId!)}
                    className="text-green-600 hover:text-green-700"
                    disabled={saving}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-600 hover:text-red-700"
                    disabled={saving}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Permissions:</h4>
                <ul className="space-y-2">
                  {editPermissions.map((perm, idx) => (
                    <li key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Action"
                        value={perm.action}
                        onChange={e => handlePermissionChange(idx, 'action', e.target.value)}
                        className="border rounded px-2 py-1 w-24"
                        disabled={saving}
                      />
                      <span>on</span>
                      <input
                        type="text"
                        placeholder="Resource"
                        value={perm.resource}
                        onChange={e => handlePermissionChange(idx, 'resource', e.target.value)}
                        className="border rounded px-2 py-1 w-32"
                        disabled={saving}
                      />
                      <button
                        onClick={() => handleRemovePermission(idx)}
                        className="text-red-500 hover:text-red-700"
                        disabled={saving || editPermissions.length === 1}
                        title="Remove permission"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleAddPermission}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                  disabled={saving}
                  type="button"
                >
                  + Add Permission
                </button>
              </div>
            </div>
          )}

          {roles.map((role) =>
            editingRoleId === role.id ? null : (
              <div
                key={role.id}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {role.name}
                    </h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-gray-600 hover:text-blue-600"
                      disabled={saving}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-gray-600 hover:text-red-600"
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-600">Permissions:</h4>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="w-16 font-medium">{permission.action}:</span>
                        <span className="ml-2">{permission.resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default RoleManagement;