package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "Manage employees and their commissions")
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @Operation(summary = "Create employee", operationId = "createEmployee", description = "Register a new employee with user account and initial commission")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(@Valid @RequestBody CreateEmployeeRequest request) {
        EmployeeResponse response = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Employee created", response));
    }

    @GetMapping
    @Operation(summary = "Get all employees", operationId = "getAllEmployees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getAllEmployees()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID", operationId = "getEmployeeById")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getEmployeeById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee details", operationId = "updateEmployee")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(@PathVariable Long id,
                                                                 @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Employee updated", employeeService.updateEmployee(id, request)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Toggle employee active/inactive status", operationId = "toggleEmployeeStatus")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long id) {
        employeeService.toggleStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Status updated", null));
    }

    @PutMapping("/{id}/commission")
    @Operation(summary = "Update employee commission", operationId = "updateEmployeeCommission", description = "Closes current commission and creates new one. Old sales remain unchanged.")
    public ResponseEntity<ApiResponse<CommissionResponse>> updateCommission(
            @PathVariable Long id, @Valid @RequestBody UpdateCommissionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Commission updated", employeeService.updateCommission(id, request)));
    }

    @GetMapping("/{id}/commissions")
    @Operation(summary = "Get commission history for an employee", operationId = "getEmployeeCommissionHistory")
    public ResponseEntity<ApiResponse<List<CommissionResponse>>> getCommissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(employeeService.getCommissionHistory(id)));
    }

    @PatchMapping("/{id}/reset-password")
    @Operation(summary = "Reset employee password", operationId = "resetEmployeePassword", description = "Forcibly resets an employee's password. Old password is no longer valid.")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @Valid @RequestBody ResetPasswordRequest request) {
        employeeService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", null));
    }
}
