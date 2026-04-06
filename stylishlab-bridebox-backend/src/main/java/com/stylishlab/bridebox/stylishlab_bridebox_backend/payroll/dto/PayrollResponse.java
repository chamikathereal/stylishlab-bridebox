package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PayrollResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private BigDecimal totalEarnings;
    private BigDecimal totalAdvances;
    private BigDecimal netPaid;
    private Long settledById;
    private String settledByName;
    private LocalDateTime settledAt;
    private String note;
}
