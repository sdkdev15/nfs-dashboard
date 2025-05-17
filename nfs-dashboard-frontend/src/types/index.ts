export type FileType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  lastModified: string;
  path: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  action: 'read' | 'write' | 'delete' | 'admin';
  resource: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFASecret?: string;
}

export interface MonitoringData {
  status: string;
  uptime: string;
  ramUsage: {
    total: string;
    used: string;
    free: string;
    usagePercent: string;
  };
  cpuUsagePercent: number;
  cpuCores: number;
  storage: StorageInfo[];
  folders: FolderUsage[];
}

export interface StorageInfo {
  mount: string;
  size: string;
  used: string;
  available: string;
  usage: string;
}

export interface FolderUsage {
  path: string;
  size: string;
}
