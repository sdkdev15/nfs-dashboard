import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { FileItem } from '../../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: FileItem | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
}) => {
  if (!isOpen || !file) return null;

  const isFolder = file.type === 'folder';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Confirm Deletion
          </h3>
        </div>
        
        <p className="mb-4 text-gray-600">
          Are you sure you want to delete {isFolder ? 'folder' : 'file'} <span className="font-medium">{file.name}</span>?
          {isFolder && (
            <span className="block mt-2 text-red-600 font-medium">
              Warning: All contents within this folder will be permanently deleted.
            </span>
          )}
        </p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;