package com.stylishlab.bridebox.stylishlab_bridebox_backend.report.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto.EmployeeEarningsResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto.PeriodReportResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Business insights, profit tracking, and employee performance")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    @Operation(summary = "Daily report", description = "Get daily sales, expenses, and profit summary")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getDailyReport(date)));
    }

    @GetMapping("/weekly")
    @Operation(summary = "Weekly report", description = "Get weekly summary for the week containing the given date")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> weekly(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getWeeklyReport(date)));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Monthly report", description = "Get monthly summary including bills. Format: YYYY-MM")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> monthly(@RequestParam String yearMonth) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMonthlyReport(yearMonth)));
    }

    @GetMapping("/yearly")
    @Operation(summary = "Yearly report")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> yearly(@RequestParam int year) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getYearlyReport(year)));
    }

    @GetMapping("/total")
    @Operation(summary = "Total report", description = "Get aggregated amounts for all time")
    public ResponseEntity<ApiResponse<PeriodReportResponse>> total() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getTotalReport()));
    }

    @GetMapping("/employee/earnings")
    @Operation(summary = "My earnings", description = "Employee views their own earnings (today, week, month, year)")
    public ResponseEntity<ApiResponse<EmployeeEarningsResponse>> myEarnings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMyEarnings(auth.getName(), date)));
    }

    @GetMapping("/employee/{employeeId}/earnings")
    @Operation(summary = "Employee earnings by ID", description = "Admin views any employee's earnings")
    public ResponseEntity<ApiResponse<EmployeeEarningsResponse>> employeeEarnings(
            @PathVariable Long employeeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getEmployeeEarnings(employeeId, date)));
    }
}
