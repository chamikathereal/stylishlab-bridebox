package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SettleSalaryRequest {
    @NotNull
    private Long employeeId;
    
    private String note;
}
