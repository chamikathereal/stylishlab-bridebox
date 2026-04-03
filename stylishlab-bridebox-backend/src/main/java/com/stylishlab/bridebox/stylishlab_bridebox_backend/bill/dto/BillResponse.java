package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BillResponse {
    private Long id;
    private String billType;
    private BigDecimal amount;
    private String billMonth;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String status;
    private String note;
}
