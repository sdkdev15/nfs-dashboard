import React, { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Default settings (match OpenAPI property names)
const DEFAULT_SETTINGS = {
  max_file_size: 100,
  allowed_file_types: '.jpg,.png,.pdf,.doc,.docx',
  max_storage_per_user: 5,
  enable_audit_log: false,
  session_timeout: 30,
};

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/api/admin/settings`, { headers: { Authorization: token || '' } })
      .then(res => res.json())
      .then(data => {
        setSettings({ ...DEFAULT_SETTINGS, ...data });
        setLoading(false);
      })
      .catch(() => {
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${BACKEND_URL}/api/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token || ''
      },
      body: JSON.stringify(settings)
    });
    // Optionally show a success message
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={settings.max_file_size}
              onChange={(e) =>
                setSettings({ ...settings, max_file_size: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types
            </label>
            <input
              type="text"
              value={settings.allowed_file_types}
              onChange={(e) =>
                setSettings({ ...settings, allowed_file_types: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Storage Per User (GB)
            </label>
            <input
              type="number"
              value={settings.max_storage_per_user}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_storage_per_user: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={settings.session_timeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  session_timeout: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enable_audit_log}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enable_audit_log: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable Audit Log
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          System Maintenance
        </h3>
        <div className="space-y-4">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <RefreshCw className="h-5 w-5 mr-2" />
            Clear System Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;