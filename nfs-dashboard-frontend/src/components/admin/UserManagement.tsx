import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { Shield, UserPlus, Edit2, Trash2 } from 'lucide-react';

// Mock data
const mockRoles: UserRole[] = [
  {
    id: '1',
    name: 'admin',
    permissions: [{ action: 'admin', resource: '*' }]
  },
  {
    id: '2',
    name: 'user',
    permissions: [{ action: 'read', resource: '/' }]
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    role: mockRoles[0],
    twoFactorEnabled: true
  },
  {
    id: '2',
    email: 'user@example.com',
    role: mockRoles[1],
    twoFactorEnabled: false
  }
];

const UserManagement: React.FC = () => {
  const [users] = useState<User[]>(mockUsers);
  const [roles] = useState<UserRole[]>(mockRoles);

  const updateUserRole = async (userId: string, roleId: string) => {
    console.log('Updating user role:', { userId, roleId });
    // In a real app, this would update the user's role
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <UserPlus className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
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
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="text-sm border-gray-300 rounded-md"
                    value={user.role.id}
                    onChange={(e) => updateUserRole(user.id, e.target.value)}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
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
                    <button className="text-blue-600 hover:text-blue-800">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;