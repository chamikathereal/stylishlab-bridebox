package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SalaryTrackerResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private BigDecimal currentSalary;
    private BigDecimal totalAdvances;
    private LocalDateTime lastSettlementDate;
    private BigDecimal netPayable;
}
