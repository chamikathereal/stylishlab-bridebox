package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CreditPaymentResponse {
    private Long id;
    private Long saleId;
    private String invoiceNo;
    private Long customerId;
    private String customerName;
    private BigDecimal amountPaid;
    private LocalDateTime paidAt;
    private String recordedByUsername;
    private String note;
}
