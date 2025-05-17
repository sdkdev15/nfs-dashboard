package services

import (
    "context"
    "errors"
    "fmt"
    "nfs-dashboard-backend/models"
    "nfs-dashboard-backend/repositories" // <-- import your new repo package
    "sync"
    "time"
    "github.com/google/uuid"
)

// InMemoryAdminRepository is a simple implementation of AdminRepository, now using RoleFileRepository for roles.
type InMemoryAdminRepository struct {
    admins         map[int]*models.Admin
    users          []models.User
    roleRepo       *repositories.RoleFileRepository // <-- use file-based repo
    systemSettings *models.SystemSettings
    auditLogs      []models.AuditLog
    mu             sync.RWMutex
}

func NewInMemoryAdminRepository(roleFilePath string) *InMemoryAdminRepository {
    return &InMemoryAdminRepository{
        admins:          make(map[int]*models.Admin),
        users:           []models.User{},
        roleRepo:        repositories.NewRoleFileRepository(roleFilePath), 
        systemSettings:  &models.SystemSettings{
            MaxFileSize:       100,
            AllowedFileTypes:  ".jpg,.png,.pdf,.doc,.docx",
            MaxStoragePerUser: 5,
            EnableAuditLog:    true,
            SessionTimeout:    30,
        },
        auditLogs:        []models.AuditLog{},
    }
}

// Admin CRUD
func (repo *InMemoryAdminRepository) GetAdminByID(ctx context.Context, id int) (*models.Admin, error) {
    repo.mu.RLock()
    defer repo.mu.RUnlock()
    admin, ok := repo.admins[id]
    if !ok {
        return nil, errors.New("admin not found")
    }
    return admin, nil
}

func (repo *InMemoryAdminRepository) CreateAdmin(ctx context.Context, admin *models.Admin) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    if admin == nil || admin.ID == 0 {
        return errors.New("invalid admin data")
    }
    if _, exists := repo.admins[admin.ID]; exists {
        return errors.New("admin already exists")
    }
    repo.admins[admin.ID] = admin
    repo.appendAuditLog("create_admin", fmt.Sprintf("%d", admin.ID), fmt.Sprintf("Created admin %s", admin.Email))
    return nil
}

func (repo *InMemoryAdminRepository) UpdateAdmin(ctx context.Context, admin *models.Admin) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    if admin == nil || admin.ID == 0 {
        return errors.New("invalid admin data")
    }
    if _, exists := repo.admins[admin.ID]; !exists {
        return errors.New("admin not found")
    }
    repo.admins[admin.ID] = admin
    repo.appendAuditLog("update_admin", fmt.Sprintf("%d", admin.ID), fmt.Sprintf("Updated admin %s", admin.Email))
    return nil
}

func (repo *InMemoryAdminRepository) DeleteAdmin(ctx context.Context, id int) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    if _, exists := repo.admins[id]; !exists {
        return errors.New("admin not found")
    }
    delete(repo.admins, id)
    repo.appendAuditLog("delete_admin", fmt.Sprintf("%d", id), fmt.Sprintf("Deleted admin %d", id))
    return nil
}

// Controller support
func (repo *InMemoryAdminRepository) GetUsers() ([]models.User, error) {
    repo.mu.RLock()
    defer repo.mu.RUnlock()
    return repo.users, nil
}

// GetRoles now uses RoleFileRepository
func (repo *InMemoryAdminRepository) GetRoles() ([]models.Role, error) {
    return repo.roleRepo.GetRoles()
}

func (repo *InMemoryAdminRepository) GetSystemSettings() (*models.SystemSettings, error) {
    repo.mu.RLock()
    defer repo.mu.RUnlock()
    return repo.systemSettings, nil
}

// GetUserByID finds a user by ID.
func (repo *InMemoryAdminRepository) GetUserByID(id string) (*models.User, error) {
    repo.mu.RLock()
    defer repo.mu.RUnlock()
    for _, user := range repo.users {
        if user.ID == id {
            return &user, nil
        }
    }
    return nil, errors.New("user not found")
}

// DisableUser2FA disables 2FA for a user by clearing their secret and flag.
func (repo *InMemoryAdminRepository) DisableUser2FA(id string) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    for i, user := range repo.users {
        if user.ID == id {
            repo.users[i].TwoFactorEnabled = false
            repo.users[i].TwoFASecret = ""
            repo.appendAuditLog("disable_2fa", user.ID, fmt.Sprintf("Disabled 2FA for user %s", user.Email))
            return nil
        }
    }
    return errors.New("user not found")
}

// GetAuditLogs returns a list of audit logs.
func (repo *InMemoryAdminRepository) GetAuditLogs() ([]models.AuditLog, error) {
    repo.mu.RLock()
    defer repo.mu.RUnlock()
    return repo.auditLogs, nil
}

// GetRoleByID now uses RoleFileRepository
func (repo *InMemoryAdminRepository) GetRoleByID(id string) (*models.Role, error) {
    return repo.roleRepo.GetRoleByID(id)
}

// BulkDeleteUsers deletes multiple users by their IDs.
func (repo *InMemoryAdminRepository) BulkDeleteUsers(ids []string) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    idSet := make(map[string]struct{})
    for _, id := range ids {
        idSet[id] = struct{}{}
    }
    filtered := repo.users[:0]
    for _, user := range repo.users {
        if _, found := idSet[user.ID]; !found {
            filtered = append(filtered, user)
        } else {
            repo.appendAuditLog("bulk_delete_user", user.ID, fmt.Sprintf("Bulk deleted user %s", user.Email))
        }
    }
    repo.users = filtered
    return nil
}

// Helper to append an audit log entry
func (repo *InMemoryAdminRepository) appendAuditLog(action, userID, details string) {
    if repo.systemSettings != nil && !repo.systemSettings.EnableAuditLog {
        return
    }
    log := models.AuditLog{
        ID:        uuid.New().String(),
        Action:    action,
        UserID:    userID,
        Timestamp: time.Now(),
        Details:   details,
    }
    repo.auditLogs = append(repo.auditLogs, log)
}

func (repo *InMemoryAdminRepository) CreateRole(role models.Role) error {
    err := repo.roleRepo.CreateRole(role)
    if err == nil {
        repo.appendAuditLog("create_role", fmt.Sprintf("%d", role.ID), fmt.Sprintf("Created role %s", role.Name))
    }
    return err
}

func (repo *InMemoryAdminRepository) UpdateRole(role models.Role) error {
    err := repo.roleRepo.UpdateRole(role)
    if err == nil {
        repo.appendAuditLog("update_role", fmt.Sprintf("%d", role.ID), fmt.Sprintf("Updated role %s", role.Name))
    }
    return err
}

func (repo *InMemoryAdminRepository) DeleteRole(id int) error {
    err := repo.roleRepo.DeleteRole(id)
    if err == nil {
        repo.appendAuditLog("delete_role", fmt.Sprintf("%d", id), fmt.Sprintf("Deleted role %d", id))
    }
    return err
}

// CreateUser adds a new user.
func (repo *InMemoryAdminRepository) CreateUser(user models.User) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    // Check for duplicate ID or email
    for _, u := range repo.users {
        if u.ID == user.ID {
            return errors.New("user ID already exists")
        }
        if u.Email == user.Email {
            return errors.New("user email already exists")
        }
    }
    repo.users = append(repo.users, user)
    repo.appendAuditLog("create_user", user.ID, "Created user "+user.Email)
    return nil
}

// UpdateUser updates an existing user.
func (repo *InMemoryAdminRepository) UpdateUser(user models.User) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    for i := range repo.users {
        if repo.users[i].ID == user.ID {
            repo.users[i] = user
            repo.appendAuditLog("update_user", user.ID, "Updated user "+user.Email)
            return nil
        }
    }
    return errors.New("user not found")
}

// DeleteUser removes a user by ID.
func (repo *InMemoryAdminRepository) DeleteUser(id string) error {
    repo.mu.Lock()
    defer repo.mu.Unlock()
    for i, user := range repo.users {
        if user.ID == id {
            repo.appendAuditLog("delete_user", user.ID, "Deleted user "+user.Email)
            repo.users = append(repo.users[:i], repo.users[i+1:]...)
            return nil
        }
    }
    return errors.New("user not found")
}