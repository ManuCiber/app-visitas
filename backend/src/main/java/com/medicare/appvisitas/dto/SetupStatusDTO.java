package com.medicare.appvisitas.dto;

public class SetupStatusDTO {

    private boolean adminExists;
    private long totalUsuarios;

    public SetupStatusDTO() {
    }

    public SetupStatusDTO(boolean adminExists, long totalUsuarios) {
        this.adminExists = adminExists;
        this.totalUsuarios = totalUsuarios;
    }

    public boolean isAdminExists() {
        return adminExists;
    }

    public void setAdminExists(boolean adminExists) {
        this.adminExists = adminExists;
    }

    public long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }
}
