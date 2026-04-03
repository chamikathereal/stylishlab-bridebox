package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.service.PayeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payees")
@RequiredArgsConstructor
@Tag(name = "Payee / Debtor Management", description = "Manage suppliers, banks, and other payment recipients")
public class PayeeController {

    private final PayeeService payeeService;

    @PostMapping
    @Operation(summary = "Create payee")
    public ResponseEntity<ApiResponse<PayeeResponse>> create(@Valid @RequestBody CreatePayeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Payee created", payeeService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Get all payees")
    public ResponseEntity<ApiResponse<List<PayeeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(payeeService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payee by ID")
    public ResponseEntity<ApiResponse<PayeeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(payeeService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update payee")
    public ResponseEntity<ApiResponse<PayeeResponse>> update(@PathVariable Long id, @RequestBody UpdatePayeeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payee updated", payeeService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle payee active/inactive")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        payeeService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Status toggled", null));
    }
}
