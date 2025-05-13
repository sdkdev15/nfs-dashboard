import React, { useState, useEffect } from 'react';
import { User, FileItem, BreadcrumbItem } from '../types';
import Breadcrumbs from './Breadcrumbs';
import SearchBar from './SearchBar';
import ActionBar from './ActionBar';
import FileList from './FileList';
import { Server } from 'lucide-react';
import { getFiles, getBreadcrumbsFromPath, createFolder, uploadFile, deleteItem, renameItem } from '../utils/fileUtils';
import CreateFolderModal from './modals/CreateFolderModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import RenameModal from './modals/RenameModal';
import FilePreviewModal from './modals/FilePreviewModal';
import UploadProgress, { UploadItem } from './UploadProgress';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';

interface FileManagerProps {
  user: User | null;
}

const FileManager: React.FC<FileManagerProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Upload progress state
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  useEffect(() => {
    loadFiles(currentPath);
    setBreadcrumbs(getBreadcrumbsFromPath(currentPath));
  }, [currentPath]);

  const loadFiles = async (path: string) => {
    setIsLoading(true);
    try {
      const files = await getFiles(path);
      setFiles(files);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query) {
      loadFiles(currentPath);
      return;
    }

    const filteredFiles = files.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    setFiles(filteredFiles);
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder(currentPath, folderName);
      loadFiles(currentPath);
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleUpload = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const uploadId = Math.random().toString(36).substring(7);
      const upload: UploadItem = {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: 'uploading'
      };
      
      setUploads(prev => [...prev, upload]);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 20;
        
        if (progress <= 100) {
          setUploads(prev => 
            prev.map(u => 
              u.id === uploadId 
                ? { ...u, progress } 
                : u
            )
          );
        }
        
        if (progress === 100) {
          clearInterval(interval);
          try {
            await uploadFile(currentPath, file);
            setUploads(prev =>
              prev.map(u =>
                u.id === uploadId
                  ? { ...u, status: 'success', progress: 100 }
                  : u
              )
            );
            loadFiles(currentPath);
          } catch (error) {
            setUploads(prev =>
              prev.map(u =>
                u.id === uploadId
                  ? { ...u, status: 'error', error: 'Upload failed' }
                  : u
              )
            );
          }
          
          setTimeout(() => {
            setUploads(prev => prev.filter(u => u.id !== uploadId));
          }, 3000);
        }
      }, 500);
    });
  };

  const handleFileAction = (action: string, file: FileItem) => {
    setSelectedFile(file);
    switch (action) {
      case 'preview':
        setShowPreview(true);
        break;
      case 'rename':
        setShowRename(true);
        break;
      case 'delete':
        setShowDeleteConfirm(true);
        break;
      case 'download':
        if (file.type === 'file') {
          // In a real app, this would trigger a file download
          console.log('Downloading:', file.name);
        }
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const handleRename = async (file: FileItem, newName: string) => {
    try {
      await renameItem(file, newName);
      loadFiles(currentPath);
      setShowRename(false);
    } catch (error) {
      console.error('Error renaming item:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedFile) {
      try {
        await deleteItem(selectedFile);
        loadFiles(currentPath);
        setShowDeleteConfirm(false);
        setSelectedFile(null);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Server className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">NFS Explorer</h1>
                <p className="text-sm text-gray-500">
                  Logged in as: {user?.email} ({user?.role.name})
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-full sm:w-auto">
                <SearchBar onSearch={handleSearch} />
              </div>
              {user && <ProfileDropdown user={user} onLogout={handleLogout} />}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        <Breadcrumbs items={breadcrumbs} onNavigate={setCurrentPath} />
        
        <ActionBar
          currentPath={currentPath}
          onRefresh={() => loadFiles(currentPath)}
          onCreateFolder={() => setShowCreateFolder(true)}
          onUpload={handleUpload}
        />
        
        <FileList
          files={files}
          onSelect={setSelectedFile}
          onNavigate={setCurrentPath}
          onAction={handleFileAction}
          isLoading={isLoading}
        />
      </main>

      {/* Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onConfirm={handleCreateFolder}
        currentPath={currentPath}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        file={selectedFile}
      />
      
      <RenameModal
        isOpen={showRename}
        onClose={() => setShowRename(false)}
        onConfirm={handleRename}
        file={selectedFile}
      />
      
      <FilePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={() => console.log('Downloading:', selectedFile?.name)}
        file={selectedFile}
      />

      {/* Upload progress */}
      <UploadProgress
        uploads={uploads}
        onDismiss={(id) => setUploads(prev => prev.filter(u => u.id !== id))}
        onDismissAll={() => setUploads([])}
      />
    </div>
  );
};

export default FileManager;