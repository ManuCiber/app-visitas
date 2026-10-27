package com.medicare.appvisitas.controller;

import com.medicare.appvisitas.dto.ZonaDTO;
import com.medicare.appvisitas.service.ZonaService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/zonas")
public class ZonaController {

    private final ZonaService zonaService;

    public ZonaController(ZonaService zonaService) {
        this.zonaService = zonaService;
    }

    @GetMapping
    public ResponseEntity<List<ZonaDTO>> listarTodas() {
        return ResponseEntity.ok(zonaService.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<ZonaDTO>> listarActivas() {
        return ResponseEntity.ok(zonaService.listarActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ZonaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(zonaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ZonaDTO> crear(@Valid @RequestBody ZonaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(zonaService.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ZonaDTO> actualizar(@PathVariable Long id, @Valid @RequestBody ZonaDTO dto) {
        return ResponseEntity.ok(zonaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        zonaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
