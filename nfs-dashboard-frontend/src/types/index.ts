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
  memory: {
    total: string;
    used: string;
    free: string;
    shared: string;
    "buff/cache": string; 
    available: string;
  };
  cpu_cores: number;
  cpu_load: {
    '1m': string;
    '5m': string;
    '15m': string;
  };
  disks: DiskInfo[];
  folder_usages: FolderUsage[];
}

export interface DiskInfo {
  filesystem: string;
  type: string;
  size: string;
  used: string;
  available: string;
  usePercent: string; 
  mounted_on: string;
}

export interface FolderUsage {
  folder: string;
  size: string;
}

