package controllers

import (
    "encoding/json"
    "net/http"
    "nfs-dashboard-backend/services"
)

type MonitoringController struct {
    monitoringService *services.MonitoringService
}

func NewMonitoringController() *MonitoringController {
    return &MonitoringController{
        monitoringService: services.NewMonitoringService(nil), // Pass nil for default logger
    }
}

func (mc *MonitoringController) GetMonitoringData(w http.ResponseWriter, r *http.Request) {
    data, err := mc.monitoringService.GetMonitoringData()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(data)
}