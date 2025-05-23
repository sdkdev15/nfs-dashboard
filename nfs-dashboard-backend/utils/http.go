package utils

import (
    "encoding/json"
    "net/http"
)

// RespondWithError sends an error response with a given status code and message.
func RespondWithError(w http.ResponseWriter, code int, message string) {
    RespondWithJSON(w, code, map[string]string{"error": message})
}

// RespondWithJSON sends a JSON response with a given status code and payload.
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(code)
    json.NewEncoder(w).Encode(payload)
}