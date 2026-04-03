package com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PeriodReportResponse {
    private String period;
    private BigDecimal totalSales;
    private BigDecimal cashReceived;
    private BigDecimal creditSales;
    private BigDecimal employeeCommissions;
    private BigDecimal totalExpenses;
    private BigDecimal totalBills;
    private BigDecimal ownerRevenue;
    private BigDecimal netProfit;
    private Long totalTransactions;
}
