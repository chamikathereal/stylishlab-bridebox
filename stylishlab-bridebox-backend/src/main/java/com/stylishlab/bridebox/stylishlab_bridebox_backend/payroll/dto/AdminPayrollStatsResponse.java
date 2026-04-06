package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminPayrollStatsResponse {
    private BigDecimal totalPendingSalary;
    private BigDecimal totalPaidThisMonth;
    private BigDecimal totalAdvancesGiven;
    private long employeesPendingPaymentCount;
}
