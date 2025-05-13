import React, { useState } from 'react';
import { Upload, FolderPlus, RefreshCw } from 'lucide-react';

interface ActionBarProps {
  currentPath: string;
  onRefresh: () => void;
  onCreateFolder: () => void;
  onUpload: (files: FileList) => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  currentPath,
  onRefresh,
  onCreateFolder,
  onUpload,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      // Reset the input value so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={onRefresh}
        className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        <span>Refresh</span>
      </button>
      
      <button
        onClick={onCreateFolder}
        className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
      >
        <FolderPlus className="h-4 w-4 mr-1" />
        <span>New Folder</span>
      </button>
      
      <label className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
        <Upload className="h-4 w-4 mr-1" />
        <span>Upload</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />
      </label>
      
      <div className="ml-4 text-sm text-gray-600">
        Current location: <span className="font-medium">{currentPath}</span>
      </div>
    </div>
  );
};

export default ActionBar;