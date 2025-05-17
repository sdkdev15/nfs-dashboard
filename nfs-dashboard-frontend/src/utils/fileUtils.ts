import { FileItem, FileType } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileTypeIcon = (type: FileType, name: string): string => {
  if (type === 'folder') return 'folder';
  const extension = name.split('.').pop()?.toLowerCase() || '';
  switch (extension) {
    case 'pdf': return 'file-text';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'image';
    case 'mp4':
    case 'mov':
    case 'avi': return 'video';
    case 'mp3':
    case 'wav': return 'music';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz': return 'archive';
    case 'doc':
    case 'docx': return 'file-text';
    case 'xls':
    case 'xlsx': return 'file-spreadsheet';
    case 'ppt':
    case 'pptx': return 'file-presentation';
    default: return 'file';
  }
};

// CRUD Operations using backend API
export const getFiles = async (path: string): Promise<FileItem[]> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL}/api/files?path=${encodeURIComponent(path)}`, {
    headers: { Authorization: token || '' }
  });
  if (!res.ok) throw new Error('Failed to fetch files');
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((item: any, idx: number) => ({
    id: item.id || item.path || idx.toString(),
    name: item.name,
    type: item.is_dir ? 'folder' : 'file',
    size: item.size ?? 0,
    lastModified: item.lastModified ?? '',
    path: item.path,
  }));
};

export const createFolder = async (path: string, name: string): Promise<FileItem> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL}/api/files/folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || ''
    },
    body: JSON.stringify({ path, name })
  });
  if (!res.ok) throw new Error('Failed to create folder');
  return await res.json();
};

export const downloadFile = async (file: FileItem): Promise<void> => {
  const token = localStorage.getItem('token');
  const url = `${BACKEND_URL}/api/files/download?path=${encodeURIComponent(file.path)}&mode=download`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: token || '' }
  });

  if (!res.ok) throw new Error('Gagal mendownload file');

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

export const uploadFile = async (path: string, file: File): Promise<FileItem> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);
  const res = await fetch(`${BACKEND_URL}/api/files/upload`, {
    method: 'POST',
    headers: { Authorization: token || '' },
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return await res.json();
};

export const deleteItem = async (item: FileItem): Promise<void> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL}/api/files`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || ''
    },
    body: JSON.stringify({ path: item.path })
  });
  if (!res.ok) throw new Error('Failed to delete item');
};

export const renameItem = async (item: FileItem, newName: string): Promise<FileItem> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BACKEND_URL}/api/files/rename`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token || ''
    },
    body: JSON.stringify({ path: item.path, newName })
  });
  if (!res.ok) throw new Error('Failed to rename item');
  return await res.json();
};

// export const copyItem = async (sourcePath: string, destinationPath: string): Promise<void> => {
//   const token = localStorage.getItem('token');
//   const res = await fetch(`${BACKEND_URL}/api/files/copy`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: token || ''
//     },
//     body: JSON.stringify({ sourcePath, destinationPath })
//   });
//   if (!res.ok) throw new Error('Failed to copy item');
// };

// export const moveItem = async (sourcePath: string, destinationPath: string): Promise<void> => {
//   const token = localStorage.getItem('token');
//   const res = await fetch(`${BACKEND_URL}/api/files/move`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: token || ''
//     },
//     body: JSON.stringify({ sourcePath, destinationPath })
//   });
//   if (!res.ok) throw new Error('Failed to move item');
// };

export const getBreadcrumbsFromPath = (path: string): { name: string; path: string }[] => {
  if (path === '/') {
    return [{ name: 'Home', path: '/' }];
  }
  const parts = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Home', path: '/' }];
  let currentPath = '';
  parts.forEach(part => {
    currentPath += `/${part}`;
    breadcrumbs.push({ name: part, path: currentPath });
  });
  return breadcrumbs;
};