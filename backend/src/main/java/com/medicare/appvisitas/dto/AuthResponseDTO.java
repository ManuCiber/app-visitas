package com.medicare.appvisitas.dto;

public class AuthResponseDTO {

    private String token;
    private String tokenType = "Bearer";
    private UsuarioResponseDTO usuario;
    private String mensaje;

    public AuthResponseDTO() {
    }

    public AuthResponseDTO(String token, UsuarioResponseDTO usuario) {
        this.token = token;
        this.tokenType = "Bearer";
        this.usuario = usuario;
    }

    public AuthResponseDTO(String token, UsuarioResponseDTO usuario, String mensaje) {
        this.token = token;
        this.tokenType = "Bearer";
        this.usuario = usuario;
        this.mensaje = mensaje;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UsuarioResponseDTO getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioResponseDTO usuario) {
        this.usuario = usuario;
    }
}
