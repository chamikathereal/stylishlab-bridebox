package com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class EmployeeEarningsResponse {
    private Long employeeId;
    private String employeeName;
    private BigDecimal todayEarnings;
    private Long todayServices;
    private BigDecimal weekEarnings;
    private Long weekServices;
    private BigDecimal monthEarnings;
    private Long monthServices;
    private BigDecimal yearEarnings;
    private Long yearServices;
}
