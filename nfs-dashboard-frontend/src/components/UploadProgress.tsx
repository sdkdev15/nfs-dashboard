import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadProgressProps {
  uploads: UploadItem[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onDismiss,
  onDismissAll,
}) => {
  if (uploads.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-700">Uploads</h3>
        <button
          onClick={onDismissAll}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="overflow-y-auto p-2 flex-grow">
        {uploads.map(upload => (
          <div key={upload.id} className="mb-2 bg-gray-50 rounded p-2">
            <div className="flex justify-between items-start mb-1">
              <div className="text-sm font-medium truncate max-w-[200px]">{upload.name}</div>
              <button
                onClick={() => onDismiss(upload.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            
            {upload.status === 'uploading' && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${upload.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{upload.progress}% complete</div>
              </>
            )}
            
            {upload.status === 'success' && (
              <div className="flex items-center text-green-600 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Upload complete</span>
              </div>
            )}
            
            {upload.status === 'error' && (
              <div className="flex items-center text-red-600 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>{upload.error || 'Upload failed'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadProgress;