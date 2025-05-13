import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    maxFileSize: 100,
    allowedFileTypes: '.jpg,.png,.pdf,.doc,.docx',
    maxStoragePerUser: 5,
    enableAuditLog: true,
    sessionTimeout: 30,
  });

  const handleSave = async () => {
    try {
      // In a real app, you would save these settings to the database
      console.log('Saving settings:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

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
              value={settings.maxFileSize}
              onChange={(e) =>
                setSettings({ ...settings, maxFileSize: Number(e.target.value) })
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
              value={settings.allowedFileTypes}
              onChange={(e) =>
                setSettings({ ...settings, allowedFileTypes: e.target.value })
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
              value={settings.maxStoragePerUser}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxStoragePerUser: Number(e.target.value),
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
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableAuditLog}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableAuditLog: e.target.checked,
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