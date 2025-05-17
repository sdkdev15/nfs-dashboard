package routes

import (
    "nfs-dashboard-backend/controllers"
    "nfs-dashboard-backend/services"
    "net/http"

    "github.com/gorilla/mux"
)

func RegisterRoutes(router *mux.Router) {
    // Initialize services
    adminRepo := services.NewInMemoryAdminRepository("roles.json")
    authService, err := services.NewAuthService("users.json")
    if err != nil {
        panic("Failed to initialize AuthService: " + err.Error())
    }
    fileService := services.NewFileService()
    adminService := services.NewAdminService(adminRepo) // Implement your AdminRepository

    // Initialize controllers with dependencies
    authController := controllers.NewAuthController(authService)
    fileController := controllers.NewFileController(*fileService)
    monitoringController := controllers.NewMonitoringController()
    adminController := controllers.NewAdminController(adminService)
    
    // Auth routes
    router.HandleFunc("/api/auth/login", authController.Login).Methods(http.MethodPost)
    router.HandleFunc("/api/auth/register", authController.Register).Methods(http.MethodPost)
    router.HandleFunc("/api/auth/profile", authController.Profile).Methods(http.MethodGet)
    router.HandleFunc("/api/generate-2fa-secret", authController.Generate2FASecret).Methods(http.MethodPost)
    router.HandleFunc("/api/verify-2fa", authController.Verify2FA).Methods(http.MethodPost)
    router.HandleFunc("/api/logout", authController.Logout).Methods(http.MethodPost)
    router.HandleFunc("/api/change-password", authController.ChangePassword).Methods(http.MethodPost)
    router.HandleFunc("/api/disable-2fa", authController.Disable2FA).Methods(http.MethodPost)

    // File management routes
    router.HandleFunc("/api/files", fileController.ListFiles).Methods(http.MethodGet)
    router.HandleFunc("/api/files/folder", fileController.CreateFolder).Methods(http.MethodPost)
    router.HandleFunc("/api/files/upload", fileController.UploadFile).Methods(http.MethodPost)
    router.HandleFunc("/api/files/rename", fileController.RenameItem).Methods(http.MethodPut)
    router.HandleFunc("/api/files", fileController.DeleteItem).Methods(http.MethodDelete)
    router.HandleFunc("/api/files/download", fileController.DownloadFile).Methods(http.MethodGet)
    router.HandleFunc("/api/files/preview", fileController.PreviewFile).Methods(http.MethodGet)
    router.HandleFunc("/api/files/info", fileController.GetFileInfo).Methods(http.MethodGet)
    router.HandleFunc("/api/files/stream", fileController.StreamFile).Methods(http.MethodGet)

    // Monitoring
    router.HandleFunc("/api/monitoring", monitoringController.GetMonitoringData).Methods(http.MethodGet)

    // Admin user CRUD
    router.HandleFunc("/api/admin/users", adminController.ManageUsers).Methods(http.MethodGet) // List all users
    router.HandleFunc("/api/admin/users", adminController.CreateUser).Methods(http.MethodPost)
    router.HandleFunc("/api/admin/users/{id}", adminController.GetUserByID).Methods(http.MethodGet)
    router.HandleFunc("/api/admin/users/{id}", adminController.UpdateUser).Methods(http.MethodPut)
    router.HandleFunc("/api/admin/users/{id}", adminController.DeleteUser).Methods(http.MethodDelete)
    router.HandleFunc("/api/admin/users/{id}/disable-2fa", adminController.Disable2FA).Methods(http.MethodPost)
    router.HandleFunc("/api/admin/users/bulk-delete", adminController.BulkDeleteUsers).Methods(http.MethodPost)

    // Admin roles CRUD
    router.HandleFunc("/api/admin/roles", adminController.ManageRoles).Methods(http.MethodGet) // List all roles
    router.HandleFunc("/api/admin/roles", adminController.CreateRole).Methods(http.MethodPost)
    router.HandleFunc("/api/admin/roles/{id}", adminController.GetRoleByID).Methods(http.MethodGet)
    router.HandleFunc("/api/admin/roles/{id}", adminController.UpdateRole).Methods(http.MethodPut)
    router.HandleFunc("/api/admin/roles/{id}", adminController.DeleteRole).Methods(http.MethodDelete)

    // System settings and audit logs
    router.HandleFunc("/api/admin/settings", adminController.SystemSettings).Methods(http.MethodGet, http.MethodPut)
    router.HandleFunc("/api/admin/audit-logs", adminController.GetAuditLogs).Methods(http.MethodGet)
}