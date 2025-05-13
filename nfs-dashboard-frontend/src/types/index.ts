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
  role: UserRole;
  twoFactorEnabled: boolean;
}