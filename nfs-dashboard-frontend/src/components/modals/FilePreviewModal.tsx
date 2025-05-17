import React from 'react';
import { X, Download, FileText, Image, Video, File, Archive, Music } from 'lucide-react';
import { FileItem } from '../../types';
import { formatFileSize, getFileTypeIcon } from '../../utils/fileUtils';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  file: FileItem | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  file,
}) => {
  if (!isOpen || !file || file.type !== 'file') return null;

  const getFileIcon = () => {
    const iconType = getFileTypeIcon('file', file.name);
    switch (iconType) {
      case 'file-text':
        return <FileText className="h-16 w-16 text-orange-500" />;
      case 'image':
        return <Image className="h-16 w-16 text-purple-500" />;
      case 'video':
        return <Video className="h-16 w-16 text-red-500" />;
      case 'music':
        return <Music className="h-16 w-16 text-green-500" />;
      case 'archive':
        return <Archive className="h-16 w-16 text-yellow-500" />;
      default:
        return <File className="h-16 w-16 text-gray-500" />;
    }
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = () => {
    const ext = getFileExtension(file.name);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  const isVideo = () => {
    const ext = getFileExtension(file.name);
    return ['mp4', 'webm', 'ogg'].includes(ext);
  };

  const isAudio = () => {
    const ext = getFileExtension(file.name);
    return ['mp3', 'wav', 'ogg'].includes(ext);
  };

  const isPdf = () => {
    return getFileExtension(file.name) === 'pdf';
  };

  const isText = () => {
    const ext = getFileExtension(file.name);
    return ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(ext);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Construct the download/preview URL
  const fileUrl = `${BACKEND_URL}/api/files/download?path=${encodeURIComponent(file.path)}`;

  const renderPreview = () => {
    if (isImage()) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
          <img
            src={fileUrl}
            alt={file.name}
            className="max-h-60 max-w-full object-contain rounded"
            style={{ background: '#fff' }}
          />
        </div>
      );
    } else if (isVideo()) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
          <video controls className="max-h-60 max-w-full rounded" src={fileUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else if (isAudio()) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-20">
          <audio controls className="w-full" src={fileUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (isPdf()) {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
          <iframe
            src={fileUrl}
            title={file.name}
            className="w-full h-60 rounded"
            style={{ background: '#fff' }}
          />
        </div>
      );
    } else if (isText()) {
      // Optionally, fetch and display text content here
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
          <FileText className="h-16 w-16 mx-auto text-orange-500 mb-2" />
          <p className="ml-3 text-gray-500">Text preview not implemented</p>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center bg-gray-100 rounded-lg h-64">
          {getFileIcon()}
          <p className="ml-3 text-gray-500">Preview not available for this file type</p>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 relative mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 truncate max-w-2xl">{file.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={onDownload}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-1" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {renderPreview()}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">File name:</span>
              <span className="ml-2 text-gray-600">{file.name}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">File size:</span>
              <span className="ml-2 text-gray-600">{formatFileSize(file.size)}</span>
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Last modified:</span>
              <span className="ml-2 text-gray-600">{formatDate(file.lastModified)}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Path:</span>
              <span className="ml-2 text-gray-600">{file.path}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;