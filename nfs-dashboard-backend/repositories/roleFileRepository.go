package repositories

import (
    "encoding/json"
    "fmt"
    "os"
    "strconv"
    "sync"
    "nfs-dashboard-backend/models"
)

type RoleFileRepository struct {
    filePath string
    mu       sync.Mutex
}

func NewRoleFileRepository(filePath string) *RoleFileRepository {
    return &RoleFileRepository{filePath: filePath}
}

func (r *RoleFileRepository) loadRoles() ([]models.Role, error) {
    r.mu.Lock()
    defer r.mu.Unlock()
    file, err := os.ReadFile(r.filePath)
    if err != nil {
        return nil, err
    }
    var roles []models.Role
    if err := json.Unmarshal(file, &roles); err != nil {
        return nil, err
    }
    return roles, nil
}

func (r *RoleFileRepository) saveRoles(roles []models.Role) error {
    r.mu.Lock()
    defer r.mu.Unlock()
    data, err := json.MarshalIndent(roles, "", "  ")
    if err != nil {
        return err
    }
    return os.WriteFile(r.filePath, data, 0644)
}

func (r *RoleFileRepository) GetRoles() ([]models.Role, error) {
    return r.loadRoles()
}

func (r *RoleFileRepository) GetRoleByID(id string) (*models.Role, error) {
    roles, err := r.loadRoles()
    if err != nil {
        return nil, err
    }
    intID, err := strconv.Atoi(id)
    if err != nil {
        return nil, fmt.Errorf("invalid role id")
    }
    for _, role := range roles {
        if role.ID == intID {
            return &role, nil
        }
    }
    return nil, fmt.Errorf("role not found")
}

func (r *RoleFileRepository) CreateRole(role models.Role) error {
    roles, err := r.loadRoles()
    if err != nil {
        return err
    }
    // Check for duplicate ID
    for _, existing := range roles {
        if existing.ID == role.ID {
            return fmt.Errorf("role with ID %d already exists", role.ID)
        }
    }
    roles = append(roles, role)
    return r.saveRoles(roles)
}

func (r *RoleFileRepository) UpdateRole(role models.Role) error {
    roles, err := r.loadRoles()
    if err != nil {
        return err
    }
    updated := false
    for i, existing := range roles {
        if existing.ID == role.ID {
            roles[i] = role
            updated = true
            break
        }
    }
    if !updated {
        return fmt.Errorf("role with ID %d not found", role.ID)
    }
    return r.saveRoles(roles)
}

func (r *RoleFileRepository) DeleteRole(id int) error {
    roles, err := r.loadRoles()
    if err != nil {
        return err
    }
    idx := -1
    for i, existing := range roles {
        if existing.ID == id {
            idx = i
            break
        }
    }
    if idx == -1 {
        return fmt.Errorf("role with ID %d not found", id)
    }
    roles = append(roles[:idx], roles[idx+1:]...)
    return r.saveRoles(roles)
}