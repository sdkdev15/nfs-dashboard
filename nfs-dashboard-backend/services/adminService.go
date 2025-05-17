package services

import (
    "context"
    "errors"
    "nfs-dashboard-backend/models"
)

type AdminServiceInterface interface {
    GetAdmin(ctx context.Context, id int) (*models.Admin, error)
    CreateAdmin(ctx context.Context, admin *models.Admin) error
    UpdateAdmin(ctx context.Context, admin *models.Admin) error
    DeleteAdmin(ctx context.Context, id int) error

    // User management
    GetUsers() ([]models.User, error)
    GetUserByID(id string) (*models.User, error)
    CreateUser(user models.User) error
    UpdateUser(user models.User) error
    DeleteUser(id string) error
    BulkDeleteUsers(ids []string) error

    // Role management
    GetRoles() ([]models.Role, error)
    GetRoleByID(id string) (*models.Role, error)
    CreateRole(role models.Role) error
    UpdateRole(role models.Role) error
    DeleteRole(id int) error

    // System settings
    GetSystemSettings() (*models.SystemSettings, error)

    // 2FA and audit
    DisableUser2FA(id string) error
    GetAuditLogs() ([]models.AuditLog, error)
}

// AdminService defines the service for admin-related operations.
type AdminService struct {
    repo AdminRepository // Dependency on a repository interface
}

// AdminRepository defines the interface for admin data operations.
type AdminRepository interface {
    GetAdminByID(ctx context.Context, id int) (*models.Admin, error)
    CreateAdmin(ctx context.Context, admin *models.Admin) error
    UpdateAdmin(ctx context.Context, admin *models.Admin) error
    DeleteAdmin(ctx context.Context, id int) error

    // User management
    GetUsers() ([]models.User, error)
    GetUserByID(id string) (*models.User, error)
    CreateUser(user models.User) error
    UpdateUser(user models.User) error
    DeleteUser(id string) error
    BulkDeleteUsers(ids []string) error

    // Role management
    GetRoles() ([]models.Role, error)
    GetRoleByID(id string) (*models.Role, error)
    CreateRole(role models.Role) error
    UpdateRole(role models.Role) error
    DeleteRole(id int) error

    // System settings
    GetSystemSettings() (*models.SystemSettings, error)

    // 2FA and audit
    DisableUser2FA(id string) error
    GetAuditLogs() ([]models.AuditLog, error)
}

// NewAdminService creates a new instance of AdminService.
func NewAdminService(repo AdminRepository) *AdminService {
    return &AdminService{repo: repo}
}

// GetAdmin retrieves an admin by ID.
func (s *AdminService) GetAdmin(ctx context.Context, id int) (*models.Admin, error) {
    if id <= 0 {
        return nil, errors.New("invalid admin ID")
    }
    return s.repo.GetAdminByID(ctx, id)
}

// CreateAdmin creates a new admin.
func (s *AdminService) CreateAdmin(ctx context.Context, admin *models.Admin) error {
    if admin == nil || admin.Name == "" || admin.Email == "" {
        return errors.New("invalid admin data")
    }
    return s.repo.CreateAdmin(ctx, admin)
}

// UpdateAdmin updates an existing admin.
func (s *AdminService) UpdateAdmin(ctx context.Context, admin *models.Admin) error {
    if admin == nil || admin.ID <= 0 {
        return errors.New("invalid admin data")
    }
    return s.repo.UpdateAdmin(ctx, admin)
}

// DeleteAdmin deletes an admin by ID.
func (s *AdminService) DeleteAdmin(ctx context.Context, id int) error {
    if id <= 0 {
        return errors.New("invalid admin ID")
    }
    return s.repo.DeleteAdmin(ctx, id)
}

// For controller support:
func (s *AdminService) GetUsers() ([]models.User, error) {
    return s.repo.GetUsers()
}
func (s *AdminService) GetRoles() ([]models.Role, error) {
    return s.repo.GetRoles()
}
func (s *AdminService) GetSystemSettings() (*models.SystemSettings, error) {
    return s.repo.GetSystemSettings()
}

func (s *AdminService) GetUserByID(id string) (*models.User, error) {
    // Find user by ID in repo
    return s.repo.GetUserByID(id)
}

func (s *AdminService) DisableUser2FA(id string) error {
    return s.repo.DisableUser2FA(id)
}

func (s *AdminService) GetAuditLogs() ([]models.AuditLog, error) {
    return s.repo.GetAuditLogs()
}

func (s *AdminService) GetRoleByID(id string) (*models.Role, error) {
    return s.repo.GetRoleByID(id)
}

func (s *AdminService) BulkDeleteUsers(ids []string) error {
    return s.repo.BulkDeleteUsers(ids)
}

func (s *AdminService) CreateRole(role models.Role) error {
    return s.repo.CreateRole(role)
}

func (s *AdminService) UpdateRole(role models.Role) error {
    return s.repo.UpdateRole(role)
}

func (s *AdminService) DeleteRole(id int) error {
    return s.repo.DeleteRole(id)
}

func (s *AdminService) CreateUser(user models.User) error {
    return s.repo.CreateUser(user)
}

func (s *AdminService) UpdateUser(user models.User) error {
    return s.repo.UpdateUser(user)
}

func (s *AdminService) DeleteUser(id string) error {
    return s.repo.DeleteUser(id)
}