package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateBillRequest {
    @NotBlank(message = "Bill type is required")
    private String billType;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Bill month is required (format: YYYY-MM)")
    private String billMonth;

    private LocalDate dueDate;
    private LocalDate paidDate;
    private String note;
}
