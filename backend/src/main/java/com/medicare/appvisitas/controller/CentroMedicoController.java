package com.medicare.appvisitas.controller;

import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.CentroMedicoRequestDTO;
import com.medicare.appvisitas.dto.CentroMedicoResponseDTO;
import com.medicare.appvisitas.service.CentroMedicoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/centros-medicos")
public class CentroMedicoController {

    private final CentroMedicoService centroMedicoService;

    public CentroMedicoController(CentroMedicoService centroMedicoService) {
        this.centroMedicoService = centroMedicoService;
    }

    @GetMapping
    public ResponseEntity<List<CentroMedicoResponseDTO>> listar(
            @RequestParam(required = false, defaultValue = "false") boolean soloActivos
    ) {
        List<CentroMedicoResponseDTO> resultado = soloActivos
                ? centroMedicoService.listarActivos()
                : centroMedicoService.listarTodos();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CentroMedicoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(centroMedicoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<CentroMedicoResponseDTO> crear(@Valid @RequestBody CentroMedicoRequestDTO dto) {
        CentroMedicoResponseDTO creado = centroMedicoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PostMapping("/reutilizar")
    public ResponseEntity<CentroMedicoResponseDTO> crearOReutilizar(@Valid @RequestBody CentroMedicoRequestDTO dto) {
        CentroMedicoResponseDTO resultado = centroMedicoService.crearOReutilizar(dto);
        return ResponseEntity.ok(resultado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CentroMedicoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CentroMedicoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        CentroMedicoResponseDTO actualizado = centroMedicoService.actualizar(id, dto, usuarioActual);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        centroMedicoService.eliminar(id, usuarioActual);
        return ResponseEntity.noContent().build();
    }
}
