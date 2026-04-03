package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class CommissionResponse {
    private Long id;
    private Long employeeId;
    private BigDecimal employeePercent;
    private BigDecimal ownerPercent;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
