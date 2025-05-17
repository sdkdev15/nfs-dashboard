// src/pages/MonitoringSystem.tsx
import React, { useEffect, useState } from 'react';
import type { MonitoringData } from '@/types';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const MonitoringSystem: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/api/monitoring`, {
      headers: { Authorization: token || '' }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch monitoring data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Monitoring System</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">General Info</h3>
            <p><strong>Status:</strong> {data.status}</p>
            <p><strong>Uptime:</strong> {data.uptime}</p>
            <p><strong>CPU Cores:</strong> {data.cpuCores}</p>
            <p><strong>CPU Usage:</strong> {data.cpuUsagePercent.toFixed(2)}%</p>
            <p><strong>RAM:</strong> {data.ramUsage.used} / {data.ramUsage.total} ({data.ramUsage.usagePercent})</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Storage</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Mount</th>
                  <th className="px-4 py-2 text-left">Size</th>
                  <th className="px-4 py-2 text-left">Used</th>
                  <th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Usage</th>
                </tr>
              </thead>
              <tbody>
                {data.storage.map((disk, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{disk.mount}</td>
                    <td className="px-4 py-2">{disk.size}</td>
                    <td className="px-4 py-2">{disk.used}</td>
                    <td className="px-4 py-2">{disk.available}</td>
                    <td className="px-4 py-2">{disk.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Folder Usage</h3>
            <table className="min-w-full table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Path</th>
                  <th className="px-4 py-2 text-left">Size</th>
                </tr>
              </thead>
              <tbody>
                {data.folders.map((folder, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{folder.path}</td>
                    <td className="px-4 py-2">{folder.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MonitoringSystem;
