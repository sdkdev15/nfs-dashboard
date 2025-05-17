package services

import (
    "log"
    "os"
    "os/exec"
    "runtime"
    "strings"
    "sync"
)

// MonitoringService handles monitoring-related operations.
type MonitoringService struct {
    logger *log.Logger
    mu     sync.Mutex
}

// NewMonitoringService creates a new instance of MonitoringService.
// If logger is nil, it uses the default logger.
func NewMonitoringService(logger *log.Logger) *MonitoringService {
    if logger == nil {
        logger = log.Default()
    }
    return &MonitoringService{
        logger: logger,
    }
}

// GetMonitoringData retrieves system monitoring data.
func (ms *MonitoringService) GetMonitoringData() (map[string]interface{}, error) {
    ms.mu.Lock()
    defer ms.mu.Unlock()

    data := make(map[string]interface{})
    var wg sync.WaitGroup

    // Channel untuk hasil paralel
    folderUsageCh := make(chan map[string]string, 50)
    errorCh := make(chan error, 10)

    // ===== UPTIME =====
    uptimeOutput, err := exec.Command("uptime", "-p").Output()
    if err != nil {
        ms.logger.Println("Failed to retrieve uptime:", err)
        return nil, err
    }
    data["uptime"] = strings.TrimSpace(string(uptimeOutput))

    // ===== CPU LOAD =====
    cpuOutput, err := exec.Command("uptime").Output()
    if err != nil {
        ms.logger.Println("Failed to retrieve CPU load:", err)
        return nil, err
    }
    parts := strings.Split(string(cpuOutput), "load average:")
    if len(parts) > 1 {
        loadAverages := strings.Split(strings.TrimSpace(parts[1]), ",")
        data["cpu_load"] = map[string]string{
            "1m":  strings.TrimSpace(loadAverages[0]),
            "5m":  strings.TrimSpace(loadAverages[1]),
            "15m": strings.TrimSpace(loadAverages[2]),
        }
    }

    // ===== MEMORY =====
    freeOutput, err := exec.Command("free", "-m").Output()
    if err != nil {
        ms.logger.Println("Failed to retrieve memory usage:", err)
        return nil, err
    }
    ramLines := strings.Split(string(freeOutput), "\n")
    if len(ramLines) > 1 {
        fields := strings.Fields(ramLines[1])
        if len(fields) >= 7 {
            data["memory"] = map[string]string{
                "total":      fields[1] + " MB",
                "used":       fields[2] + " MB",
                "free":       fields[3] + " MB",
                "shared":     fields[4] + " MB",
                "buff/cache": fields[5] + " MB",
                "available":  fields[6] + " MB",
            }
        }
    }

    // ===== DISK =====
    dfOutput, err := exec.Command("df", "-h", "--output=source,fstype,size,used,avail,pcent,target").Output()
    if err != nil {
        ms.logger.Println("Failed to retrieve disk usage:", err)
        return nil, err
    }
    lines := strings.Split(string(dfOutput), "\n")
    var disks []map[string]string
    for i, line := range lines {
        if i == 0 || line == "" {
            continue // Skip header
        }
        fields := strings.Fields(line)
        if len(fields) >= 7 {
            disks = append(disks, map[string]string{
                "filesystem": fields[0],
                "type":       fields[1],
                "size":       fields[2],
                "used":       fields[3],
                "available":  fields[4],
                "use%":       fields[5],
                "mounted_on": fields[6],
            })
        }
    }
    data["disks"] = disks

    // ===== CPU CORES =====
    data["cpu_cores"] = runtime.NumCPU()

    // ===== FOLDER USAGES (Paralel) =====
    entries, err := os.ReadDir("/")
    if err != nil {
        ms.logger.Println("Failed to read root directory:", err)
        return nil, err
    }

    for _, entry := range entries {
        if entry.IsDir() {
            wg.Add(1)
            go func(name string) {
                defer wg.Done()
                path := "/" + name
                out, err := exec.Command("du", "-sh", path).Output()
                if err != nil {
                    errorCh <- err
                    return
                }
                usage := strings.Fields(string(out))
                if len(usage) >= 1 {
                    folderUsageCh <- map[string]string{
                        "folder": name,
                        "size":   usage[0],
                    }
                }
            }(entry.Name())
        }
    }

    // Tunggu semua goroutine selesai
    go func() {
        wg.Wait()
        close(folderUsageCh)
        close(errorCh)
    }()

    var folderUsages []map[string]string
    for usage := range folderUsageCh {
        folderUsages = append(folderUsages, usage)
    }

    if len(errorCh) > 0 {
        ms.logger.Println("Some errors occurred during folder size collection.")
        for err := range errorCh {
            ms.logger.Println("Folder usage error:", err)
        }
    }

    data["folder_usages"] = folderUsages
    data["status"] = "ok"
    ms.logger.Println("Monitoring data retrieved successfully")
    return data, nil
}
