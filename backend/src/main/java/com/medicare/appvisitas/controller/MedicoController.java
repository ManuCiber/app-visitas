package com.medicare.appvisitas.controller;

import com.medicare.appvisitas.domain.model.EstadoMedico;
import com.medicare.appvisitas.domain.model.Usuario;
import com.medicare.appvisitas.dto.MedicoRequestDTO;
import com.medicare.appvisitas.dto.MedicoResponseDTO;
import com.medicare.appvisitas.dto.PageResponseDTO;
import com.medicare.appvisitas.service.MedicoService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @GetMapping
    public ResponseEntity<PageResponseDTO<MedicoResponseDTO>> listar(
            @AuthenticationPrincipal Usuario usuarioActual,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) EstadoMedico estado,
            @RequestParam(required = false) Long centroId,
            @RequestParam(required = false) Long visitadorId
    ) {
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        PageResponseDTO<MedicoResponseDTO> resultado = medicoService.listarMedicos(
                usuarioActual, pageable, search, especialidad, estado, centroId, visitadorId
        );
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> obtenerPorId(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        return ResponseEntity.ok(medicoService.obtenerPorId(id, usuarioActual));
    }

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> crear(
            @Valid @RequestBody MedicoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        MedicoResponseDTO creado = medicoService.crear(dto, usuarioActual);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MedicoRequestDTO dto,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        MedicoResponseDTO actualizado = medicoService.actualizar(id, dto, usuarioActual);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal Usuario usuarioActual
    ) {
        medicoService.eliminar(id, usuarioActual);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/especialidades")
    public ResponseEntity<List<String>> obtenerEspecialidades(@AuthenticationPrincipal Usuario usuarioActual) {
        return ResponseEntity.ok(medicoService.obtenerEspecialidades(usuarioActual));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas(@AuthenticationPrincipal Usuario usuarioActual) {
        return ResponseEntity.ok(medicoService.obtenerEstadisticas(usuarioActual));
    }
}
