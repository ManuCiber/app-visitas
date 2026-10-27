package com.medicare.appvisitas.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicare.appvisitas.domain.model.CentroMedico;
import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Rol;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.domain.repository.CentroMedicoRepository;
import com.medicare.appvisitas.domain.repository.MedicoRepository;
import com.medicare.appvisitas.domain.repository.UsuarioRepository;
import com.medicare.appvisitas.dto.MedicoRequestDTO;
import com.medicare.appvisitas.security.JwtService;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MedicoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private CentroMedicoRepository centroMedicoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    private Long centroId;
    private Usuario visitadorTest;
    private String token;

    @BeforeEach
    void setUp() {
        medicoRepository.deleteAll();
        centroMedicoRepository.deleteAll();
        usuarioRepository.deleteAll();

        visitadorTest = usuarioRepository.save(
                new Usuario("Carlos", "Visitador", "carlos.test@medicare.do", "hash", Rol.VISITADOR, null)
        );

        token = "Bearer " + jwtService.generateToken(visitadorTest);

        CentroMedico centro = centroMedicoRepository.save(
                new CentroMedico("Centro Santo Domingo", "Av. Winston Churchill", "8095551122", "Santo Domingo", EstadoMedico.ACTIVO)
        );
        centroId = centro.getId();
    }

    @Test
    @DisplayName("GET /api/v1/medicos debe retornar página con status 200 para visitador autenticado con JWT")
    void debeListarMedicos() throws Exception {
        mockMvc.perform(get("/api/v1/medicos")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pageNumber").value(0))
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/medicos debe retornar 201 al crear médico válido asignado al visitador")
    void debeCrearMedicoValido() throws Exception {
        MedicoRequestDTO dto = new MedicoRequestDTO();
        dto.setNombres("Luisa");
        dto.setApellidos("Fernández");
        dto.setCedula("001-2233445-5");
        dto.setExequatur("EX-4050");
        dto.setEspecialidad("Neurología");
        dto.setTelefono("809-555-9000");
        dto.setCorreo("luisa.fernandez@test.com");
        dto.setDireccionProfesional("Av. Sarasota 45");
        dto.setEstado(EstadoMedico.ACTIVO);
        dto.setCentrosMedicosIds(Set.of(centroId));

        mockMvc.perform(post("/api/v1/medicos")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nombreCompleto").value("Luisa Fernández"))
                .andExpect(jsonPath("$.cedula").value("001-2233445-5"))
                .andExpect(jsonPath("$.visitadorId").value(visitadorTest.getId()))
                .andExpect(jsonPath("$.centrosMedicos[0].id").value(centroId));
    }

    @Test
    @DisplayName("POST /api/v1/medicos debe retornar 400 si faltan campos obligatorios o formato inválido")
    void debeFallarValidacionCamposRequeridos() throws Exception {
        MedicoRequestDTO dtoInvalido = new MedicoRequestDTO();
        dtoInvalido.setNombres(""); // Inválido
        dtoInvalido.setCorreo("correo-no-valido"); // Inválido

        mockMvc.perform(post("/api/v1/medicos")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dtoInvalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.nombres").exists())
                .andExpect(jsonPath("$.validationErrors.correo").exists());
    }
}
