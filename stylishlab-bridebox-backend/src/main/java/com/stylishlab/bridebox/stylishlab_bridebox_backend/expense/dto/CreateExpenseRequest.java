package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateExpenseRequest {
    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private Long payeeId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String note;

    @NotNull(message = "Paid by is required")
    private String paidBy;

    private LocalDate expenseDate;
}
