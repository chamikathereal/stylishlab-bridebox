package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service.ServiceCommissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-commissions")
@RequiredArgsConstructor
@Tag(name = "Service Commissions", description = "Manage per-service commission overrides for employees")
public class ServiceCommissionController {

    private final ServiceCommissionService serviceCommissionService;

    @PostMapping
    @Operation(summary = "Create service commission override",
               operationId = "createServiceCommission",
               description = "Set a custom commission rate (percentage or fixed amount) for a specific employee + service combination")
    public ResponseEntity<ApiResponse<ServiceCommissionResponse>> create(
            @Valid @RequestBody CreateServiceCommissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Service commission created", serviceCommissionService.create(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service commission by ID", operationId = "getServiceCommissionById")
    public ResponseEntity<ApiResponse<ServiceCommissionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCommissionService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service commission override", operationId = "updateServiceCommission")
    public ResponseEntity<ApiResponse<ServiceCommissionResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateServiceCommissionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Service commission updated",
                serviceCommissionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service commission override",
               operationId = "deleteServiceCommission",
               description = "Removes the override — employee will fall back to their default commission for this service")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        serviceCommissionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Service commission override removed", null));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get all service commission overrides for an employee", operationId = "getServiceCommissionsByEmployee")
    public ResponseEntity<ApiResponse<List<ServiceCommissionResponse>>> getByEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCommissionService.getByEmployee(employeeId)));
    }

    @GetMapping("/service/{serviceId}")
    @Operation(summary = "Get all employee commission overrides for a service", operationId = "getServiceCommissionsByService")
    public ResponseEntity<ApiResponse<List<ServiceCommissionResponse>>> getByService(
            @PathVariable Long serviceId) {
        return ResponseEntity.ok(ApiResponse.ok(serviceCommissionService.getByService(serviceId)));
    }
}
