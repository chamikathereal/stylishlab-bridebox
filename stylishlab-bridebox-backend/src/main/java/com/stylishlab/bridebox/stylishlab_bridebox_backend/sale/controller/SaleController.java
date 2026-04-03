package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Sales Transactions", description = "Record and manage salon sales with commission snapshots")
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    @Operation(summary = "Record a sale", description = "Creates sale with price and commission snapshots frozen at time of recording")
    public ResponseEntity<ApiResponse<SaleResponse>> create(@Valid @RequestBody CreateSaleRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Sale recorded", saleService.createSale(request, auth.getName())));
    }

    @GetMapping
    @Operation(summary = "Get all sales")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sale by ID")
    public ResponseEntity<ApiResponse<SaleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getById(id)));
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get sales by employee")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getByEmployee(employeeId)));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get sales by customer")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getByCustomer(customerId)));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get sales by date range")
    public ResponseEntity<ApiResponse<List<SaleResponse>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(saleService.getByDateRange(from, to)));
    }
}
