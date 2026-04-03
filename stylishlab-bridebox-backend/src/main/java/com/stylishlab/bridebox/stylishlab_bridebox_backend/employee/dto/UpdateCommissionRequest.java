package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateCommissionRequest {
    @NotNull(message = "Employee percent is required")
    @DecimalMin(value = "0") @DecimalMax(value = "100")
    private BigDecimal employeePercent;

    @NotNull(message = "Owner percent is required")
    @DecimalMin(value = "0") @DecimalMax(value = "100")
    private BigDecimal ownerPercent;
}
