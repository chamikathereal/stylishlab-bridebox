package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.AdminPayrollStatsResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.PayrollResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.SalaryTrackerResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.SettleSalaryRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PayrollService {
    
    // For live tracking
    void addCommissionToTracker(Long employeeId, BigDecimal amount);
    
    SalaryTrackerResponse getTrackerByEmployee(Long employeeId);
    List<SalaryTrackerResponse> getAllTrackers();
    
    AdminPayrollStatsResponse getAdminStats();

    // Settle salary
    PayrollResponse settleSalary(SettleSalaryRequest request, String adminUsername);
    
    // Historical payroll
    List<PayrollResponse> getPayrollHistoryByEmployee(Long employeeId);
    List<PayrollResponse> getPayrollHistoryByDateRange(LocalDate from, LocalDate to);
    List<PayrollResponse> getAllPayrollHistory();
}
