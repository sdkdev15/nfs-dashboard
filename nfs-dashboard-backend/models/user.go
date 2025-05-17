package models

type User struct {
    ID              string `json:"id"`
    Email           string `json:"email"`
    Password        string `json:"password"`
    Name            string `json:"name,omitempty"`
    Role            *Role  `json:"role,omitempty"`
    TwoFASecret     string `json:"twoFASecret,omitempty"`
    TwoFactorEnabled bool  `json:"twoFactorEnabled"`
}