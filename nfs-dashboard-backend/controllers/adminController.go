package controllers

import (
    "encoding/json"
    "net/http"
    "nfs-dashboard-backend/services"
    "github.com/gorilla/mux"
    "strconv"
    "nfs-dashboard-backend/models"
)

// AdminController handles admin-related operations.
type AdminController struct {
    adminService services.AdminServiceInterface
}

func NewAdminController(adminService services.AdminServiceInterface) *AdminController {
    return &AdminController{
        adminService: adminService,
    }
}

func respondWithError(w http.ResponseWriter, code int, message string) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// ManageUsers handles user management logic.
func (ac *AdminController) ManageUsers(w http.ResponseWriter, r *http.Request) {
    // Example: Fetch users from the service
    users, err := ac.adminService.GetUsers()
    if (err != nil) {
        respondWithError(w, http.StatusInternalServerError, "Failed to fetch users")
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(users); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to encode response")
    }
}

// ManageRoles handles role management logic.
func (ac *AdminController) ManageRoles(w http.ResponseWriter, r *http.Request) {
    // Example: Fetch roles from the service
    roles, err := ac.adminService.GetRoles()
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to fetch roles")
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(roles); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to encode response")
    }
}

// SystemSettings handles system settings logic.
func (ac *AdminController) SystemSettings(w http.ResponseWriter, r *http.Request) {
    // Example: Fetch system settings from the service
    settings, err := ac.adminService.GetSystemSettings()
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to fetch system settings")
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(settings); err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to encode response")
    }
}

// GetUserByID handles GET /api/admin/users/{id}
func (ac *AdminController) GetUserByID(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]
    user, err := ac.adminService.GetUserByID(id)
    if err != nil {
        respondWithError(w, http.StatusNotFound, "User not found")
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// GetRoleByID handles GET /api/admin/roles/{id}
func (ac *AdminController) GetRoleByID(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]
    role, err := ac.adminService.GetRoleByID(id)
    if err != nil {
        respondWithError(w, http.StatusNotFound, "Role not found")
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(role)
}

// Disable2FA disables 2FA for a user (POST /api/admin/users/{id}/disable-2fa)
func (ac *AdminController) Disable2FA(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]
    err := ac.adminService.DisableUser2FA(id)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to disable 2FA")
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

// GetAuditLogs handles GET /api/admin/audit-logs
func (ac *AdminController) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
    logs, err := ac.adminService.GetAuditLogs()
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to fetch audit logs")
        return
    }
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(logs)
}

// BulkDeleteUsers handles POST /api/admin/users/bulk-delete
func (ac *AdminController) BulkDeleteUsers(w http.ResponseWriter, r *http.Request) {
    var req struct {
        IDs []string `json:"ids"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request")
        return
    }
    err := ac.adminService.BulkDeleteUsers(req.IDs)
    if err != nil {
        respondWithError(w, http.StatusInternalServerError, "Failed to delete users")
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

// CreateRole handles POST /api/admin/roles
func (ac *AdminController) CreateRole(w http.ResponseWriter, r *http.Request) {
    var role models.Role
    if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request")
        return
    }
    if err := ac.adminService.CreateRole(role); err != nil {
        respondWithError(w, http.StatusBadRequest, err.Error())
        return
    }
    w.WriteHeader(http.StatusCreated)
}

// UpdateRole handles PUT /api/admin/roles/{id}
func (ac *AdminController) UpdateRole(w http.ResponseWriter, r *http.Request) {
    var role models.Role

    // Decode the JSON body into the role struct
    if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    // Extract and convert the ID from URL
    idStr := mux.Vars(r)["id"]
    id, err := strconv.Atoi(idStr)
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid role ID")
        return
    }

    // Assign the parsed ID to the role
    role.ID = id

    // Call the service to update the role
    if err := ac.adminService.UpdateRole(role); err != nil {
        respondWithError(w, http.StatusBadRequest, err.Error())
        return
    }

    // Respond with 204 No Content on success
    w.WriteHeader(http.StatusNoContent)
}


// DeleteRole handles DELETE /api/admin/roles/{id}
func (ac *AdminController) DeleteRole(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.Atoi(vars["id"])
    if err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid role ID")
        return
    }
    if err := ac.adminService.DeleteRole(id); err != nil {
        respondWithError(w, http.StatusNotFound, err.Error())
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

// CreateUser handles POST /api/admin/users
func (ac *AdminController) CreateUser(w http.ResponseWriter, r *http.Request) {
    var user models.User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request")
        return
    }
    if err := ac.adminService.CreateUser(user); err != nil {
        respondWithError(w, http.StatusBadRequest, err.Error())
        return
    }
    w.WriteHeader(http.StatusCreated)
}

// UpdateUser handles PUT /api/admin/users/{id}
func (ac *AdminController) UpdateUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    var user models.User
    if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
        respondWithError(w, http.StatusBadRequest, "Invalid request")
        return
    }
    user.ID = vars["id"]
    if err := ac.adminService.UpdateUser(user); err != nil {
        respondWithError(w, http.StatusBadRequest, err.Error())
        return
    }
    w.WriteHeader(http.StatusNoContent)
}

// DeleteUser handles DELETE /api/admin/users/{id}
func (ac *AdminController) DeleteUser(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]
    if err := ac.adminService.DeleteUser(id); err != nil {
        respondWithError(w, http.StatusNotFound, err.Error())
        return
    }
    w.WriteHeader(http.StatusNoContent)
}