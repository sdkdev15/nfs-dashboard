import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FileItem } from '../../types';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: FileItem, newName: string) => void;
  file: FileItem | null;
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (file) {
      setNewName(file.name);
    }
  }, [file]);

  if (!isOpen || !file) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError('Name cannot be empty');
      return;
    }
    
    if (/[<>:"/\\|?*]/.test(newName)) {
      setError('Name contains invalid characters');
      return;
    }
    
    onConfirm(file, newName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Rename {file.type === 'folder' ? 'Folder' : 'File'}
        </h3>
        
        <div className="mb-4 text-sm text-gray-600">
          Original name: <span className="font-medium">{file.name}</span>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">
              New Name
            </label>
            <input
              type="text"
              id="newName"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              placeholder="Enter new name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;