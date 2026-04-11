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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    public ResponseEntity<ApiResponse<Page<SaleResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = createPageable(page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(saleService.getAll(search, pageable)));
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
    public ResponseEntity<ApiResponse<Page<SaleResponse>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Pageable pageable = createPageable(page, size, sort);
        return ResponseEntity.ok(ApiResponse.ok(saleService.getByDateRange(from, to, search, pageable)));
    }

    private Pageable createPageable(int page, int size, String sort) {
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
    }
}
