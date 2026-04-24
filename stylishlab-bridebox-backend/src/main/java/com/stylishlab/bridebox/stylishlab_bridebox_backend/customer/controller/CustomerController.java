package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "Manage salon customers")
public class CustomerController {

    private final CustomerService customerService;

    @PostMapping
    @Operation(summary = "Create customer", operationId = "createCustomer")
    public ResponseEntity<ApiResponse<CustomerResponse>> create(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Customer created", customerService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Get all customers", operationId = "getAllCustomers")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID", operationId = "getCustomerById")
    public ResponseEntity<ApiResponse<CustomerResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer", operationId = "updateCustomer")
    public ResponseEntity<ApiResponse<CustomerResponse>> update(@PathVariable Long id, @RequestBody UpdateCustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Customer updated", customerService.update(id, request)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers by name", operationId = "searchCustomers")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> search(@RequestParam String name) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.search(name)));
    }
}
