import React from 'react';
import { FileItem as FileItemType } from '../types';
import { formatFileSize, getFileTypeIcon } from '../utils/fileUtils';
import { File, Folder, MoreVertical, Download, Trash2, Edit, Copy, Move, FileText, Image, Video, Music, Archive, FileSpreadsheet, Presentation as FilePresentation } from 'lucide-react';

interface FileItemProps {
  file: FileItemType;
  onSelect: (file: FileItemType) => void;
  onNavigate?: (path: string) => void;
  onAction: (action: string, file: FileItemType) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  onSelect,
  onNavigate,
  onAction,
}) => {
  const [showActions, setShowActions] = React.useState(false);
  
  const getIcon = () => {
    const iconType = getFileTypeIcon(file.type, file.name);
    switch (iconType) {
      case 'folder':
        return <Folder className="h-5 w-5 text-blue-600" />;
      case 'file-text':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'music':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'archive':
        return <Archive className="h-5 w-5 text-yellow-500" />;
      case 'file-spreadsheet':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'file-presentation':
        return <FilePresentation className="h-5 w-5 text-red-600" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDoubleClick = () => {
    if (file.type === 'folder' && onNavigate) {
      onNavigate(file.path);
    } else {
      // Preview file
      onAction('preview', file);
    }
  };

  const handleClick = () => {
    onSelect(file);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div
      className="group flex items-center p-3 border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer relative"
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center">
          <div className="font-medium text-gray-800 truncate mr-2">{file.name}</div>
          {file.type === 'file' && (
            <div className="text-xs text-gray-500 hidden sm:block">
              {formatFileSize(file.size)}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate hidden sm:block">
          Last modified: {formatDate(file.lastModified)}
        </div>
      </div>
      
      {/* Mobile visible size */}
      <div className="flex-shrink-0 text-xs text-gray-500 mr-2 sm:hidden">
        {file.type === 'file' ? formatFileSize(file.size) : ''}
      </div>
      
      {/* Action buttons */}
      <div className={`absolute right-2 flex space-x-1 ${showActions ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}>
        {file.type === 'file' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction('download', file);
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
            title="Download"
          >
            <Download className="h-4 w-4 text-gray-600" />
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction('rename', file);
          }}
          className="p-1 hover:bg-gray-200 rounded-full"
          title="Rename"
        >
          <Edit className="h-4 w-4 text-gray-600" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction('copy', file);
          }}
          className="p-1 hover:bg-gray-200 rounded-full"
          title="Copy"
        >
          <Copy className="h-4 w-4 text-gray-600" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction('move', file);
          }}
          className="p-1 hover:bg-gray-200 rounded-full"
          title="Move"
        >
          <Move className="h-4 w-4 text-gray-600" />
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction('delete', file);
          }}
          className="p-1 hover:bg-gray-200 rounded-full"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default FileItem;