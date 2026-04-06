package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateAdvanceRequestDto {
    @NotNull
    @DecimalMin(value = "0.01", message = "Requested amount must be greater than zero")
    private BigDecimal requestedAmount;

    private String note;
}
