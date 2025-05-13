import React from 'react';
import { FileItem as FileItemType } from '../types';
import FileItem from './FileItem';
import { FolderOpen } from 'lucide-react';

interface FileListProps {
  files: FileItemType[];
  onSelect: (file: FileItemType) => void;
  onNavigate: (path: string) => void;
  onAction: (action: string, file: FileItemType) => void;
  isLoading: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onSelect,
  onNavigate,
  onAction,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <FolderOpen className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">This folder is empty</p>
        <p className="text-sm mt-1">Upload files or create a new folder to get started</p>
      </div>
    );
  }

  // Separate folders and files
  const folders = files.filter(file => file.type === 'folder');
  const fileItems = files.filter(file => file.type === 'file');
  
  // Sort alphabetically within each group
  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
  const sortedFiles = [...fileItems].sort((a, b) => a.name.localeCompare(b.name));
  
  // Combine with folders first, then files
  const sortedItems = [...sortedFolders, ...sortedFiles];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600 grid grid-cols-12">
        <div className="col-span-7 sm:col-span-6">Name</div>
        <div className="col-span-3 hidden sm:block">Last Modified</div>
        <div className="col-span-2 hidden sm:block">Size</div>
        <div className="col-span-5 sm:col-span-1 text-right">Actions</div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {sortedItems.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onSelect={onSelect}
            onNavigate={onNavigate}
            onAction={onAction}
          />
        ))}
      </div>
    </div>
  );
};

export default FileList;