package controllers

import (
    "encoding/json"
    "net/http"
    "os"
    "path/filepath"
    "mime"
    "io"
    "nfs-dashboard-backend/services"
    "time"
)

type FileController struct {
    fileService services.FileService
}

// NewFileController creates a new FileController with the provided FileService.
func NewFileController(fileService services.FileService) *FileController {
    return &FileController{
        fileService: fileService,
    }
}

// respondJSON encodes the response as JSON and writes it to the ResponseWriter.
func respondJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if data != nil {
        json.NewEncoder(w).Encode(data)
    }
}

// handleError handles errors by sending an appropriate HTTP response.
func handleError(w http.ResponseWriter, err error, status int) {
    http.Error(w, err.Error(), status)
}

func (fc *FileController) ListFiles(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    if path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    files, err := fc.fileService.ListFiles(path)
    if err != nil {
        handleError(w, err, http.StatusInternalServerError)
        return
    }

    respondJSON(w, http.StatusOK, files)
}

func (fc *FileController) CreateFolder(w http.ResponseWriter, r *http.Request) {
    var folderData struct {
        Path string `json:"path"`
        Name string `json:"name"`
    }

    if err := json.NewDecoder(r.Body).Decode(&folderData); err != nil {
        handleError(w, err, http.StatusBadRequest)
        return
    }

    if folderData.Path == "" || folderData.Name == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    folder, err := fc.fileService.CreateFolder(folderData.Path, folderData.Name)
    if err != nil {
        handleError(w, err, http.StatusInternalServerError)
        return
    }

    respondJSON(w, http.StatusCreated, folder)
}

func (fc *FileController) UploadFile(w http.ResponseWriter, r *http.Request) {
    // Parse the multipart form
    err := r.ParseMultipartForm(10 << 20) // Limit upload size to 10MB
    if err != nil {
        handleError(w, err, http.StatusBadRequest)
        return
    }

    // Retrieve the file from the form data
    file, handler, err := r.FormFile("file")
    if err != nil {
        handleError(w, err, http.StatusBadRequest)
        return
    }
    defer file.Close()

    // Retrieve the target path from the form data
    targetPath := r.FormValue("path")
    if targetPath == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    // Call the file service to handle the file upload
    uploadedFile, err := fc.fileService.UploadFile(targetPath, handler.Filename, file)
    if err != nil {
        handleError(w, err, http.StatusInternalServerError)
        return
    }

    // Respond with the uploaded file details
    respondJSON(w, http.StatusCreated, uploadedFile)
}

func (fc *FileController) RenameItem(w http.ResponseWriter, r *http.Request) {
    var renameData struct {
        Path    string `json:"path"`
        NewName string `json:"newName"`
    }

    if err := json.NewDecoder(r.Body).Decode(&renameData); err != nil {
        handleError(w, err, http.StatusBadRequest)
        return
    }

    if renameData.Path == "" || renameData.NewName == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    item, err := fc.fileService.RenameItem(renameData.Path, renameData.NewName)
    if err != nil {
        handleError(w, err, http.StatusInternalServerError)
        return
    }

    respondJSON(w, http.StatusOK, item)
}

func (fc *FileController) DeleteItem(w http.ResponseWriter, r *http.Request) {
    var deleteData struct {
        Path string `json:"path"`
    }

    if err := json.NewDecoder(r.Body).Decode(&deleteData); err != nil {
        handleError(w, err, http.StatusBadRequest)
        return
    }

    if deleteData.Path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    err := fc.fileService.DeleteItem(deleteData.Path)
    if err != nil {
        handleError(w, err, http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

// DownloadFile serves a file for preview or download, supporting preview and download modes.
func (fc *FileController) DownloadFile(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    mode := r.URL.Query().Get("mode") // "preview" or "download"
    if path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    file, err := os.Open(path)
    if err != nil {
        handleError(w, err, http.StatusNotFound)
        return
    }
    defer file.Close()

    ext := filepath.Ext(path)
    mimeType := mime.TypeByExtension(ext)
    if mimeType == "" {
        mimeType = "application/octet-stream"
    }
    w.Header().Set("Content-Type", mimeType)

    disposition := "inline"
    if mode == "download" {
        disposition = "attachment"
    }
    w.Header().Set("Content-Disposition", disposition+"; filename=\""+filepath.Base(path)+"\"")

    if _, err := io.Copy(w, file); err != nil {
        handleError(w, err, http.StatusInternalServerError)
    }
}

// PreviewFile serves a file for browser preview (images, pdf, text, etc.).
func (fc *FileController) PreviewFile(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    if path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    file, err := os.Open(path)
    if err != nil {
        handleError(w, err, http.StatusNotFound)
        return
    }
    defer file.Close()

    ext := filepath.Ext(path)
    mimeType := mime.TypeByExtension(ext)

    // Fallback for common text files and PDF
    switch ext {
    case ".txt", ".log", ".md", ".json", ".yaml", ".yml", ".csv", ".tsv", ".xml", ".ini", ".conf":
        mimeType = "text/plain"
    case ".pdf":
        mimeType = "application/pdf"
    }

    if mimeType == "" {
        mimeType = "application/octet-stream"
    }

    w.Header().Set("Content-Type", mimeType)
    w.Header().Set("Content-Disposition", "inline; filename=\""+filepath.Base(path)+"\"")

    // Optional: limit preview for large text files
    if mimeType == "text/plain" {
        const maxPreviewSize = 2 << 20 // 2 MB
        buf := make([]byte, maxPreviewSize)
        n, err := file.Read(buf)
        if err != nil && err != io.EOF {
            handleError(w, err, http.StatusInternalServerError)
            return
        }
        w.Write(buf[:n])
        return
    }

    // For PDFs or anything else
    if _, err := io.Copy(w, file); err != nil {
        handleError(w, err, http.StatusInternalServerError)
    }
}

// GetFileInfo returns metadata for a single file.
func (fc *FileController) GetFileInfo(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    if path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    info, err := os.Stat(path)
    if err != nil {
        handleError(w, err, http.StatusNotFound)
        return
    }

    fileInfo := map[string]interface{}{
        "name":         info.Name(),
        "path":         path,
        "is_dir":       info.IsDir(),
        "size":         info.Size(),
        "lastModified": info.ModTime(),
    }
    respondJSON(w, http.StatusOK, fileInfo)
}

// StreamFile supports HTTP range requests for large files (video/audio streaming).
func (fc *FileController) StreamFile(w http.ResponseWriter, r *http.Request) {
    path := r.URL.Query().Get("path")
    if path == "" {
        handleError(w, http.ErrMissingFile, http.StatusBadRequest)
        return
    }

    file, err := os.Open(path)
    if err != nil {
        handleError(w, err, http.StatusNotFound)
        return
    }
    defer file.Close()

    http.ServeContent(w, r, filepath.Base(path), fileStatModTime(file), file)
}

// Helper to get file mod time for ServeContent
func fileStatModTime(file *os.File) (modTime time.Time) {
    fi, err := file.Stat()
    if err == nil {
        modTime = fi.ModTime()
    }
    return
}