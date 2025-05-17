import React, { useEffect, useState } from 'react';
import type { MonitoringData, DiskInfo, FolderUsage } from '@/types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
    <div
      className="h-4 bg-gradient-to-r from-blue-500 to-cyan-400"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const MonitoringSystem: React.FC = () => {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${BACKEND_URL}/api/monitoring`, {
      headers: { Authorization: token || '' },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch monitoring data');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, []);

  const getCpuUsagePercent = (data: MonitoringData) => {
    const load1m = parseFloat(data.cpu_load['1m']);
    if (isNaN(load1m) || data.cpu_cores === 0) return 0;
    return (load1m / data.cpu_cores) * 100;
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-100 font-sans">
      <h2 className="text-3xl font-bold mb-8">Monitoring System</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-700 text-red-100 rounded">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-400">Loading...</div>
      ) : data ? (
        <>
          {/* General Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition">
              <h4 className="text-lg font-semibold mb-2">Status</h4>
              <p className="text-xl">{data.status}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition">
              <h4 className="text-lg font-semibold mb-2">Uptime</h4>
              <p className="text-xl">{data.uptime}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition">
              <h4 className="text-lg font-semibold mb-2">CPU Cores</h4>
              <p className="text-xl">{data.cpu_cores}</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition">
              <h4 className="text-lg font-semibold mb-2">CPU Usage</h4>
              <p className="text-xl mb-2">{getCpuUsagePercent(data).toFixed(2)}%</p>
              <ProgressBar percent={getCpuUsagePercent(data)} />
            </div>
          </div>

          {/* RAM Usage Card */}
          <div className="bg-gray-800 rounded-lg p-6 shadow mb-8">
            <h3 className="text-xl font-semibold mb-4">Memory Usage</h3>
            <p className="mb-2">
              <strong>Used:</strong> {data.memory.used} / {data.memory.total}
            </p>
            <ProgressBar
              percent={
                ((parseFloat(data.memory.used) / parseFloat(data.memory.total)) *
                  100) ||
                0
              }
            />
            <p className="text-sm mt-3 text-gray-400">
              Free: {data.memory.free} | Shared: {data.memory.shared} | Buff/Cache:{' '}
              {data.memory['buff/cache']} | Available: {data.memory.available}
            </p>
          </div>

          {/* Disk Usage Cards */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Disk Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.disks.map((disk: DiskInfo, i) => {
                const usagePercent = parseFloat(disk.usePercent) || 0;
                return (
                  <div
                    key={i}
                    className="bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition"
                  >
                    <h4 className="font-semibold mb-1">{disk.filesystem}</h4>
                    <p className="text-sm text-gray-400 mb-2">{disk.mounted_on}</p>
                    <p className="mb-2">
                      {disk.used} / {disk.size} ({disk.type})
                    </p>
                    <ProgressBar percent={usagePercent} />
                    <p className="mt-1 text-sm">{disk.usePercent} used</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Folder Usage Table */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Folder Usage</h3>
            <div className="overflow-auto rounded-lg shadow">
              <table className="min-w-full text-gray-100 bg-gray-800 table-auto">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left">Folder</th>
                    <th className="px-4 py-2 text-left">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {data.folder_usages.map((folder: FolderUsage, i) => (
                    <tr key={i} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-2">{folder.folder}</td>
                      <td className="px-4 py-2">{folder.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MonitoringSystem;
