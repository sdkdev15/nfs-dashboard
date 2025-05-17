package controllers

import (
    "encoding/json"
    "net/http"
    "nfs-dashboard-backend/services"
    "nfs-dashboard-backend/utils"
    "log"
    "github.com/pquerna/otp/totp"
    "nfs-dashboard-backend/models"
)

type AuthController struct {
    authService *services.AuthService
}

func NewAuthController(authService *services.AuthService) *AuthController {
    return &AuthController{
        authService: authService,
    }
}

func (ac *AuthController) Login(w http.ResponseWriter, r *http.Request) {
    var credentials struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }

    if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
        log.Printf("Error decoding login payload: %v", err)
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
        return
    }

    token, err := ac.authService.Login(credentials.Email, credentials.Password)
    if err != nil {
        log.Printf("Login failed for email %s: %v", credentials.Email, err)
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid email or password")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"token": token})
}

func (ac *AuthController) Register(w http.ResponseWriter, r *http.Request) {
    var userData map[string]interface{}

    if err := json.NewDecoder(r.Body).Decode(&userData); err != nil {
        log.Printf("Error decoding register payload: %v", err)
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
        return
    }

    newUser, err := ac.authService.Register(userData)
    if err != nil {
        log.Printf("Registration failed: %v", err)
        utils.RespondWithError(w, http.StatusBadRequest, err.Error())
        return
    }

    utils.RespondWithJSON(w, http.StatusCreated, newUser)
}

func (ac *AuthController) Profile(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")
    if token == "" {
        log.Println("Authorization header missing")
        utils.RespondWithError(w, http.StatusUnauthorized, "Authorization token required")
        return
    }

    profile, err := ac.authService.GetProfile(token)
    if err != nil {
        log.Printf("Failed to retrieve profile: %v", err)
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
        return
    }

    utils.RespondWithJSON(w, http.StatusOK, profile)
}

// POST /api/generate-2fa-secret
func (ac *AuthController) Generate2FASecret(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")
    if token == "" {
        utils.RespondWithError(w, http.StatusUnauthorized, "Missing token")
        return
    }
    email, err := ac.authService.GetEmailFromToken(token)
    if err != nil {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
        return
    }

    // Find user
    var user *models.User
    for i := range ac.authService.Users {
        if ac.authService.Users[i].Email == email {
            user = &ac.authService.Users[i]
            break
        }
    }
    if user == nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }

    // Generate secret
    secret, err := totp.Generate(totp.GenerateOpts{
        Issuer:      "NFSExplorer",
        AccountName: email,
    })
    if err != nil {
        utils.RespondWithError(w, http.StatusInternalServerError, "Failed to generate secret")
        return
    }

    user.TwoFASecret = secret.Secret()
    ac.authService.SaveUsers() // persist

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{
        "secret": user.TwoFASecret,
        "email":  user.Email,
    })
}

// POST /api/verify-2fa
func (ac *AuthController) Verify2FA(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Secret string `json:"secret"`
        Token  string `json:"token"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid payload")
        return
    }

    // Find user by secret (or use JWT to get user)
    var user *models.User
    for i := range ac.authService.Users {
        if ac.authService.Users[i].TwoFASecret == req.Secret {
            user = &ac.authService.Users[i]
            break
        }
    }
    if user == nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }

    valid := totp.Validate(req.Token, req.Secret)
    if !valid {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid verification code")
        return
    }

    // Mark 2FA as enabled for the user
    user.TwoFactorEnabled = true
    ac.authService.SaveUsers() // persist the change

    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// POST /api/disable-2fa
func (ac *AuthController) Disable2FA(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")
    if token == "" {
        utils.RespondWithError(w, http.StatusUnauthorized, "Authorization token required")
        return
    }
    email, err := ac.authService.GetEmailFromToken(token)
    if err != nil {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
        return
    }
    var user *models.User
    for i := range ac.authService.Users {
        if ac.authService.Users[i].Email == email {
            user = &ac.authService.Users[i]
            break
        }
    }
    if user == nil {
        utils.RespondWithError(w, http.StatusNotFound, "User not found")
        return
    }
    user.TwoFASecret = ""
    user.TwoFactorEnabled = false
    ac.authService.SaveUsers()
    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "2FA disabled"})
}

// POST /api/logout
func (ac *AuthController) Logout(w http.ResponseWriter, r *http.Request) {
    // For JWT, logout is handled client-side by deleting the token.
    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Logged out"})
}

// POST /api/change-password
func (ac *AuthController) ChangePassword(w http.ResponseWriter, r *http.Request) {
    token := r.Header.Get("Authorization")
    if token == "" {
        utils.RespondWithError(w, http.StatusUnauthorized, "Authorization token required")
        return
    }
    var req struct {
        OldPassword string `json:"oldPassword"`
        NewPassword string `json:"newPassword"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, "Invalid payload")
        return
    }
    email, err := ac.authService.GetEmailFromToken(token)
    if err != nil {
        utils.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
        return
    }
    changed, err := ac.authService.ChangePassword(email, req.OldPassword, req.NewPassword)
    if err != nil {
        utils.RespondWithError(w, http.StatusBadRequest, err.Error())
        return
    }
    if !changed {
        utils.RespondWithError(w, http.StatusUnauthorized, "Old password incorrect")
        return
    }
    utils.RespondWithJSON(w, http.StatusOK, map[string]string{"message": "Password changed"})
}