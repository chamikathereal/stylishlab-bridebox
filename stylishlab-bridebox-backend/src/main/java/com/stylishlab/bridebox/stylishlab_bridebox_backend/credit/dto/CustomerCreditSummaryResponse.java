package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CustomerCreditSummaryResponse {
    private Long customerId;
    private String customerName;
    private BigDecimal totalDue;
    private Long pendingSalesCount;
}
