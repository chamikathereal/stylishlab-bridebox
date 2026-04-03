package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSaleRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private BigDecimal paidAmount;
}
