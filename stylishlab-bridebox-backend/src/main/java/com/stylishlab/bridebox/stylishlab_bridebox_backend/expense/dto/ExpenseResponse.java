package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private Long categoryId;
    private Long payeeId;
    private String categoryName;
    private String categoryType;
    private String payeeName;
    private BigDecimal amount;
    private BigDecimal lastAmount;
    private String note;
    private String recordedByUsername;
    private String paidBy;
    private LocalDate expenseDate;
    private String lastEditReason;
    private String lastEditNote;
    private LocalDateTime createdAt;
}
