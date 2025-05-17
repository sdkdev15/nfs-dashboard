package models

type SystemSettings struct {
    MaxFileSize        int    `json:"max_file_size"`
    AllowedFileTypes   string `json:"allowed_file_types"`
    MaxStoragePerUser  int    `json:"max_storage_per_user"`
    EnableAuditLog     bool   `json:"enable_audit_log"`
    SessionTimeout     int    `json:"session_timeout"`
}