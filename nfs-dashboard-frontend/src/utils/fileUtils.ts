import { FileItem, FileType } from '../types';

// Mock data storage
let mockFileSystem: { [path: string]: FileItem[] } = {
  '/': [
    { id: '1', name: 'Documents', type: 'folder', size: 0, lastModified: '2023-09-15T10:30:00Z', path: '/Documents' },
    { id: '2', name: 'Images', type: 'folder', size: 0, lastModified: '2023-09-14T14:22:00Z', path: '/Images' },
    { id: '3', name: 'Videos', type: 'folder', size: 0, lastModified: '2023-09-10T09:15:00Z', path: '/Videos' },
    { id: '4', name: 'README.md', type: 'file', size: 2048, lastModified: '2023-09-16T08:30:00Z', path: '/README.md' },
  ],
  '/Documents': [
    { id: '5', name: 'Report.pdf', type: 'file', size: 5242880, lastModified: '2023-09-10T10:30:00Z', path: '/Documents/Report.pdf' },
    { id: '6', name: 'Notes', type: 'folder', size: 0, lastModified: '2023-09-12T14:22:00Z', path: '/Documents/Notes' },
  ],
  '/Images': [
    { id: '7', name: 'photo.jpg', type: 'file', size: 3145728, lastModified: '2023-09-08T10:30:00Z', path: '/Images/photo.jpg' },
    { id: '8', name: 'avatar.png', type: 'file', size: 1048576, lastModified: '2023-09-07T14:22:00Z', path: '/Images/avatar.png' },
  ]
};

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
    case 'pdf':
      return 'file-text';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'mp4':
    case 'mov':
    case 'avi':
      return 'video';
    case 'mp3':
    case 'wav':
      return 'music';
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return 'archive';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'xls':
    case 'xlsx':
      return 'file-spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'file-presentation';
    default:
      return 'file';
  }
};

// CRUD Operations
export const getFiles = async (path: string): Promise<FileItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return mockFileSystem[path] || [];
};

export const createFolder = async (path: string, name: string): Promise<FileItem> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newFolder: FileItem = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    type: 'folder',
    size: 0,
    lastModified: new Date().toISOString(),
    path: `${path}/${name}`,
  };

  mockFileSystem[path] = [...(mockFileSystem[path] || []), newFolder];
  mockFileSystem[`${path}/${name}`] = []; // Initialize empty folder

  return newFolder;
};

export const uploadFile = async (path: string, file: File): Promise<FileItem> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newFile: FileItem = {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name,
    type: 'file',
    size: file.size,
    lastModified: new Date().toISOString(),
    path: `${path}/${file.name}`,
  };

  mockFileSystem[path] = [...(mockFileSystem[path] || []), newFile];
  return newFile;
};

export const deleteItem = async (item: FileItem): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
  mockFileSystem[parentPath] = mockFileSystem[parentPath].filter(f => f.id !== item.id);
  
  if (item.type === 'folder') {
    delete mockFileSystem[item.path];
  }
};

export const renameItem = async (item: FileItem, newName: string): Promise<FileItem> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const parentPath = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
  const newPath = `${parentPath}/${newName}`;
  
  const updatedItem: FileItem = {
    ...item,
    name: newName,
    path: newPath,
    lastModified: new Date().toISOString(),
  };

  mockFileSystem[parentPath] = mockFileSystem[parentPath].map(f => 
    f.id === item.id ? updatedItem : f
  );

  if (item.type === 'folder') {
    mockFileSystem[newPath] = mockFileSystem[item.path];
    delete mockFileSystem[item.path];
  }

  return updatedItem;
};

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