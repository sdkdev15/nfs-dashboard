package main

import (
    "log"
    "net/http"
    "nfs-dashboard-backend/routes"
    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
    "github.com/rs/cors"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found or error loading .env")
    }

    router := mux.NewRouter()
    routes.RegisterRoutes(router)

    // Serve Swagger files
    router.PathPrefix("/swagger.yaml").Handler(http.FileServer(http.Dir(".")))
    router.PathPrefix("/swagger/").Handler(http.StripPrefix("/swagger/", http.FileServer(http.Dir("./swaggerui"))))

    // CORS config
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:5174", "http://localhost:8080"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Content-Type", "Authorization"},
        AllowCredentials: true,
    })

    handler := c.Handler(router)

    log.Println("Server started on :8080")
    if err := http.ListenAndServe(":8080", handler); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
