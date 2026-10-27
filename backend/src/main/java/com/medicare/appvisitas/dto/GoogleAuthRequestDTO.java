package com.medicare.appvisitas.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequestDTO {

    @NotBlank(message = "El idToken de Google es obligatorio")
    private String idToken;

    private Long zonaId;

    public GoogleAuthRequestDTO() {
    }

    public GoogleAuthRequestDTO(String idToken, Long zonaId) {
        this.idToken = idToken;
        this.zonaId = zonaId;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public Long getZonaId() {
        return zonaId;
    }

    public void setZonaId(Long zonaId) {
        this.zonaId = zonaId;
    }
}
