package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service.AdvanceRequestService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/payroll")
@RequiredArgsConstructor
@Tag(name = "Admin Payroll Management", description = "Admin operations for employee salaries and advances")
public class PayrollAdminController {

    private final PayrollService payrollService;
    private final AdvanceRequestService advanceService;

    // --- Stats & Tracking ---

    @GetMapping("/stats")
    @Operation(summary = "Get overall payroll statistics")
    public ResponseEntity<ApiResponse<AdminPayrollStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getAdminStats()));
    }

    @GetMapping("/trackers")
    @Operation(summary = "Get all employee live salary trackers")
    public ResponseEntity<ApiResponse<List<SalaryTrackerResponse>>> getAllTrackers() {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getAllTrackers()));
    }

    // --- Settlement ---

    @PostMapping("/settle")
    @Operation(summary = "Settle an employee's salary")
    public ResponseEntity<ApiResponse<PayrollResponse>> settleSalary(
            @Valid @RequestBody SettleSalaryRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Salary settled successfully", payrollService.settleSalary(request, auth.getName())));
    }

    // --- Payroll History ---

    @GetMapping("/history")
    @Operation(summary = "Get all payroll history")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getAllHistory() {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getAllPayrollHistory()));
    }

    @GetMapping("/history/employee/{employeeId}")
    @Operation(summary = "Get payroll history for an employee")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getHistoryByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollHistoryByEmployee(employeeId)));
    }

    @GetMapping("/history/date-range")
    @Operation(summary = "Get payroll history by date range")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getHistoryByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollHistoryByDateRange(from, to)));
    }

    // --- Advance Requests ---

    @GetMapping("/advances")
    @Operation(summary = "Get all advance requests")
    public ResponseEntity<ApiResponse<List<AdvanceRequestResponse>>> getAllAdvances() {
        return ResponseEntity.ok(ApiResponse.ok(advanceService.getAllRequests()));
    }

    @GetMapping("/advances/status/{status}")
    @Operation(summary = "Get advance requests by status")
    public ResponseEntity<ApiResponse<List<AdvanceRequestResponse>>> getAdvancesByStatus(@PathVariable AdvanceStatus status) {
        return ResponseEntity.ok(ApiResponse.ok(advanceService.getRequestsByStatus(status)));
    }

    @PostMapping("/advances/{id}/process")
    @Operation(summary = "Approve or reject an advance request")
    public ResponseEntity<ApiResponse<AdvanceRequestResponse>> processAdvance(
            @PathVariable Long id,
            @Valid @RequestBody ApproveAdvanceRequestDto request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Advance processed successfully", advanceService.processRequest(id, request, auth.getName())));
    }
}
