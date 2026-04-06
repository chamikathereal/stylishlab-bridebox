package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.AdvanceRequestResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.CreateAdvanceRequestDto;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.PayrollResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.SalaryTrackerResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service.AdvanceRequestService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service.PayrollService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee/payroll")
@RequiredArgsConstructor
@Tag(name = "Employee Payroll Operations", description = "Endpoints for employee salary checking and advance requests")
public class PayrollEmployeeController {

    private final PayrollService payrollService;
    private final AdvanceRequestService advanceService;
    private final UserRepository userRepository;

    private Long getEmployeeId(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", auth.getName()));
        if (user.getEmployee() == null) {
            throw new ResourceNotFoundException("Employee mapping not found for user: " + auth.getName());
        }
        return user.getEmployee().getId();
    }

    @GetMapping("/tracker")
    @Operation(summary = "Get my live salary tracker")
    public ResponseEntity<ApiResponse<SalaryTrackerResponse>> getMyTracker(Authentication auth) {
        Long employeeId = getEmployeeId(auth);
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getTrackerByEmployee(employeeId)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get my payroll history")
    public ResponseEntity<ApiResponse<List<PayrollResponse>>> getMyHistory(Authentication auth) {
        Long employeeId = getEmployeeId(auth);
        return ResponseEntity.ok(ApiResponse.ok(payrollService.getPayrollHistoryByEmployee(employeeId)));
    }

    @GetMapping("/advances")
    @Operation(summary = "Get my advance requests")
    public ResponseEntity<ApiResponse<List<AdvanceRequestResponse>>> getMyAdvances(Authentication auth) {
        Long employeeId = getEmployeeId(auth);
        return ResponseEntity.ok(ApiResponse.ok(advanceService.getRequestsByEmployee(employeeId)));
    }

    @PostMapping("/advances")
    @Operation(summary = "Submit a new advance request")
    public ResponseEntity<ApiResponse<AdvanceRequestResponse>> submitAdvanceRequest(
            @Valid @RequestBody CreateAdvanceRequestDto request, Authentication auth) {
        Long employeeId = getEmployeeId(auth);
        return ResponseEntity.ok(ApiResponse.ok("Advance request submitted", advanceService.createRequest(employeeId, request)));
    }
}
