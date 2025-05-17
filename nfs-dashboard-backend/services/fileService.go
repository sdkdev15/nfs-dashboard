package services

import (
    "errors"
    "io"
    "os"
    "path/filepath"
    "nfs-dashboard-backend/models"
)

// FileService provides methods for file operations.
type FileService struct{}

// NewFileService creates a new instance of FileService.
func NewFileService() *FileService {
    return &FileService{}
}

// ListFiles lists all files and folders in a directory.
func (fs *FileService) ListFiles(path string) ([]models.File, error) {
    var files []models.File

    info, err := os.Stat(path)
    if err != nil {
        if os.IsNotExist(err) {
            return nil, errors.New("directory does not exist")
        }
        return nil, err
    }
    if !info.IsDir() {
        return nil, errors.New("provided path is not a directory")
    }

    items, err := os.ReadDir(path)
    if err != nil {
        return nil, err
    }

    for _, item := range items {
        fileInfo, err := item.Info()
        if err != nil {
            return nil, err
        }
        files = append(files, models.File{
            Name:         item.Name(),
            Path:         filepath.Join(path, item.Name()),
            IsDir:        fileInfo.IsDir(),
            Size:         fileInfo.Size(),
            LastModified: fileInfo.ModTime(),
        })
    }
    return files, nil
}

// CreateFolder creates a new folder at the specified path.
func (fs *FileService) CreateFolder(path, name string) (*models.File, error) {
    folderPath := filepath.Join(path, name)
    if _, err := os.Stat(folderPath); !os.IsNotExist(err) {
        return nil, errors.New("folder already exists")
    }
    if err := os.Mkdir(folderPath, os.ModePerm); err != nil {
        return nil, err
    }
    info, err := os.Stat(folderPath)
    if err != nil {
        return nil, err
    }
    return &models.File{
        Name:         name,
        Path:         folderPath,
        IsDir:        true,
        Size:         info.Size(),
        LastModified: info.ModTime(),
    }, nil
}

// UploadFile saves an uploaded file to the specified directory.
func (fs *FileService) UploadFile(path, filename string, file io.Reader) (*models.File, error) {
    if _, err := os.Stat(path); os.IsNotExist(err) {
        return nil, errors.New("target directory does not exist")
    }
    destPath := filepath.Join(path, filename)
    out, err := os.Create(destPath)
    if err != nil {
        return nil, err
    }
    defer out.Close()

    if _, err := io.Copy(out, file); err != nil {
        return nil, err
    }

    info, err := os.Stat(destPath)
    if err != nil {
        return nil, err
    }

    return &models.File{
        Name:         filename,
        Path:         destPath,
        IsDir:        false,
        Size:         info.Size(),
        LastModified: info.ModTime(),
    }, nil
}

// RenameItem renames a file or folder.
func (fs *FileService) RenameItem(path, newName string) (*models.File, error) {
    dir := filepath.Dir(path)
    newPath := filepath.Join(dir, newName)
    if err := os.Rename(path, newPath); err != nil {
        return nil, err
    }
    info, err := os.Stat(newPath)
    if err != nil {
        return nil, err
    }
    return &models.File{
        Name:         newName,
        Path:         newPath,
        IsDir:        info.IsDir(),
        Size:         info.Size(),
        LastModified: info.ModTime(),
    }, nil
}

// DeleteItem deletes a file or folder at the specified path.
func (fs *FileService) DeleteItem(path string) error {
    if _, err := os.Stat(path); os.IsNotExist(err) {
        return errors.New("item does not exist")
    }
    return os.RemoveAll(path)
}