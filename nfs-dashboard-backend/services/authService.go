package services

import (
    "encoding/json"
    "errors"
    "fmt"
    "os"
    "sync"
    "time"
    "github.com/golang-jwt/jwt/v4"
    "nfs-dashboard-backend/models"
)

type AuthService struct {
    Users         []models.User
    usersFilePath string
    mu            sync.Mutex // for thread-safe access
}

// NewAuthService initializes and returns a new AuthService instance.
func NewAuthService(usersFilePath string) (*AuthService, error) {
    service := &AuthService{usersFilePath: usersFilePath}
    if err := service.loadUsers(); err != nil {
        return nil, fmt.Errorf("failed to initialize AuthService: %w", err)
    }
    return service, nil
}

// loadUsers loads users from the specified JSON file.
func (s *AuthService) loadUsers() error {
    s.mu.Lock()
    defer s.mu.Unlock()
    data, err := os.ReadFile(s.usersFilePath)
    if err != nil {
        return fmt.Errorf("error reading users file: %w", err)
    }
    if err := json.Unmarshal(data, &s.Users); err != nil {
        return fmt.Errorf("error unmarshalling users data: %w", err)
    }
    return nil
}

// saveUsers persists users to the JSON file.
func (s *AuthService) saveUsers() error {
    s.mu.Lock()
    defer s.mu.Unlock()
    data, err := json.MarshalIndent(s.Users, "", "  ")
    if err != nil {
        return fmt.Errorf("error marshalling users data: %w", err)
    }
    return os.WriteFile(s.usersFilePath, data, 0644)
}

// Login authenticates a user and returns a dummy token (replace with JWT in production).
func (s *AuthService) Login(email, password string) (string, error) {
    if s == nil {
        return "", errors.New("auth service is not initialized")
    }
    s.mu.Lock()
    defer s.mu.Unlock()
    for _, user := range s.Users {
        if user.Email == email && user.Password == password {
            // TODO: Use password hashing in production.
            // Generate a real JWT token
            token, err := generateJWT(user.Email, user.Role.Name)
            if err != nil {
                return "", fmt.Errorf("failed to generate token: %w", err)
            }
            return token, nil
        }
    }
    return "", errors.New("invalid email or password")
}

// generateJWT generates a JWT token for the given email and role.
func generateJWT(email, role string) (string, error) {
    secretKey := []byte(os.Getenv("JWT_SECRET"))
    if len(secretKey) == 0 {
        return "", fmt.Errorf("JWT_SECRET environment variable is not set")
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "email": email,
        "role":  role,
        "exp":   time.Now().Add(time.Hour * 24).Unix(),
    })
    return token.SignedString(secretKey)
}

// Register adds a new user.
func (s *AuthService) Register(userData map[string]interface{}) (*models.User, error) {
    email, ok := userData["email"].(string)
    if !ok || email == "" {
        return nil, errors.New("email is required")
    }
    password, ok := userData["password"].(string)
    if !ok || password == "" {
        return nil, errors.New("password is required")
    }
    name, _ := userData["name"].(string)

    s.mu.Lock()
    defer s.mu.Unlock()
    // Check for existing user
    for _, user := range s.Users {
        if user.Email == email {
            return nil, errors.New("user already exists")
        }
    }

    newUser := models.User{
        ID:       fmt.Sprintf("%d", len(s.Users)+1),
        Email:    email,
        Password: password, // TODO: Hash the password in production!
        Name:     name,
    }
    s.Users = append(s.Users, newUser)
    if err := s.saveUsers(); err != nil {
        return nil, err
    }
    // Do not return password in response
    newUser.Password = ""
    return &newUser, nil
}

// GetProfile retrieves a user's profile based on a JWT token.
func (s *AuthService) GetProfile(token string) (*models.User, error) {
    secretKey := []byte(os.Getenv("JWT_SECRET"))
    if len(secretKey) == 0 {
        return nil, errors.New("JWT_SECRET environment variable is not set")
    }

    parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
        // Validate the alg is what you expect:
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return secretKey, nil
    })
    if err != nil || !parsedToken.Valid {
        return nil, errors.New("invalid token")
    }

    claims, ok := parsedToken.Claims.(jwt.MapClaims)
    if !ok || claims["email"] == nil {
        return nil, errors.New("invalid token claims")
    }
    email, ok := claims["email"].(string)
    if !ok {
        return nil, errors.New("invalid email in token")
    }

    s.mu.Lock()
    defer s.mu.Unlock()
    for _, user := range s.Users {
        if user.Email == email {
            safeUser := user
            safeUser.Password = "" // Do not expose password
            return &safeUser, nil
        }
    }
    return nil, errors.New("user not found")
}

func (s *AuthService) GetEmailFromToken(tokenString string) (string, error) {
    // Remove "Bearer " if present
    if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
        tokenString = tokenString[7:]
    }
    secretKey := []byte(os.Getenv("JWT_SECRET"))
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return secretKey, nil
    })
    if err != nil || !token.Valid {
        return "", errors.New("invalid token")
    }
    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return "", errors.New("invalid claims")
    }
    email, ok := claims["email"].(string)
    if !ok {
        return "", errors.New("email not found in token")
    }
    return email, nil
}

func (s *AuthService) SaveUsers() error {
    s.mu.Lock()
    defer s.mu.Unlock()
    data, err := json.MarshalIndent(s.Users, "", "  ")
    if err != nil {
        return fmt.Errorf("error marshalling users data: %w", err)
    }
    return os.WriteFile(s.usersFilePath, data, 0644)
}

// ChangePassword changes a user's password after verifying the old password.
func (s *AuthService) ChangePassword(email, oldPassword, newPassword string) (bool, error) {
    s.mu.Lock()
    defer s.mu.Unlock()
    for i := range s.Users {
        if s.Users[i].Email == email {
            if s.Users[i].Password != oldPassword {
                return false, nil
            }
            s.Users[i].Password = newPassword // TODO: Hash in production!
            if err := s.saveUsers(); err != nil {
                return false, err
            }
            return true, nil
        }
    }
    return false, errors.New("user not found")
}