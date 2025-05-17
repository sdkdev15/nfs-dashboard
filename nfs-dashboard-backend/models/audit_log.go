package models
import "time"
type AuditLog struct {
    ID        string    `json:"id"`
    Action    string    `json:"action"`
    UserID    string    `json:"userId"`
    Timestamp time.Time `json:"timestamp"`
    Details   string    `json:"details"`
}