package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service.SalonServiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Service Packages", description = "Manage salon service packages and pricing")
public class SalonServiceController {

    private final SalonServiceService salonServiceService;

    @PostMapping
    @Operation(summary = "Create service package")
    public ResponseEntity<ApiResponse<ServiceResponse>> create(@Valid @RequestBody CreateServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Service created", salonServiceService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Get all services", description = "Returns all services including inactive ones")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(salonServiceService.getAll()));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active services", description = "Returns only active services for sale entry")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(salonServiceService.getActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(salonServiceService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service package")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(@PathVariable Long id, @RequestBody UpdateServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service updated", salonServiceService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle service active/inactive")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        salonServiceService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Status toggled", null));
    }
}
