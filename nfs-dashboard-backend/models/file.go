package models

import "time"

type File struct {
    Name         string    `json:"name"`
    Path         string    `json:"path"`
    IsDir        bool      `json:"is_dir"`
    Size         int64     `json:"size"`
    LastModified time.Time `json:"lastModified"`
}

