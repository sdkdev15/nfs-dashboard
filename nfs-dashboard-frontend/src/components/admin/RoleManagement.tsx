import React, { useState } from 'react';
import { UserRole, Permission } from '../../types';
import { Shield, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

// Mock data
const initialRoles: UserRole[] = [
  {
    id: '1',
    name: 'admin',
    permissions: [{ action: 'admin', resource: '*' }]
  },
  {
    id: '2',
    name: 'user',
    permissions: [{ action: 'read', resource: '/' }]
  },
  {
    id: '3',
    name: 'readonly',
    permissions: [{ action: 'read', resource: '/' }]
  }
];

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>(initialRoles);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState('');

  const handleAddRole = () => {
    setIsAddingRole(true);
    setNewRoleName('');
    setError('');
  };

  const handleSaveNewRole = () => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (roles.some(role => role.name.toLowerCase() === newRoleName.toLowerCase())) {
      setError('Role name already exists');
      return;
    }

    const newRole: UserRole = {
      id: Math.random().toString(36).substring(7),
      name: newRoleName,
      permissions: [{ action: 'read', resource: '/' }]
    };

    setRoles([...roles, newRole]);
    setIsAddingRole(false);
    setNewRoleName('');
    setError('');
  };

  const handleEditRole = (role: UserRole) => {
    setEditingRoleId(role.id);
    setNewRoleName(role.name);
    setError('');
  };

  const handleSaveEdit = (roleId: string) => {
    if (!newRoleName.trim()) {
      setError('Role name is required');
      return;
    }

    if (roles.some(role => role.id !== roleId && role.name.toLowerCase() === newRoleName.toLowerCase())) {
      setError('Role name already exists');
      return;
    }

    setRoles(roles.map(role => 
      role.id === roleId 
        ? { ...role, name: newRoleName }
        : role
    ));
    setEditingRoleId(null);
    setNewRoleName('');
    setError('');
  };

  const handleDeleteRole = (roleId: string) => {
    if (roles.length <= 1) {
      setError('Cannot delete the last role');
      return;
    }

    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const handleCancelEdit = () => {
    setEditingRoleId(null);
    setNewRoleName('');
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
        <button
          onClick={handleAddRole}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isAddingRole && (
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
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveNewRole}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsAddingRole(false)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                {editingRoleId === role.id ? (
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="text-lg font-semibold text-gray-800 border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">
                    {role.name}
                  </h3>
                )}
              </div>
              <div className="flex space-x-2">
                {editingRoleId === role.id ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(role.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
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
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;