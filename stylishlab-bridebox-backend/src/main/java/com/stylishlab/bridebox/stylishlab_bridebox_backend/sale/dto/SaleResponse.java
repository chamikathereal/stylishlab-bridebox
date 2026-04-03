package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SaleResponse {
    private Long id;
    private String invoiceNo;
    private Long customerId;
    private String customerName;
    private Long employeeId;
    private String employeeName;
    private Long serviceId;
    private String serviceNameSnapshot;
    private BigDecimal servicePriceSnapshot;
    private BigDecimal employeePercentSnapshot;
    private BigDecimal ownerPercentSnapshot;
    private BigDecimal employeeAmount;
    private BigDecimal ownerAmount;
    private String paymentStatus;
    private BigDecimal paidAmount;
    private BigDecimal dueAmount;
    private LocalDateTime createdAt;
}
