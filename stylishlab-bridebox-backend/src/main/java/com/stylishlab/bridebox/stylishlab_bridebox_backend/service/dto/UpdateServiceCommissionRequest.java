package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateServiceCommissionRequest {

    @NotNull(message = "Commission type is required (PERCENTAGE or FIXED_AMOUNT)")
    private String commissionType;

    // Required when commissionType = PERCENTAGE
    @DecimalMin(value = "0") @DecimalMax(value = "100")
    private BigDecimal employeePercent;

    @DecimalMin(value = "0") @DecimalMax(value = "100")
    private BigDecimal ownerPercent;

    // Required when commissionType = FIXED_AMOUNT
    @DecimalMin(value = "0")
    private BigDecimal employeeFixedAmount;

    @DecimalMin(value = "0")
    private BigDecimal ownerFixedAmount;
}
