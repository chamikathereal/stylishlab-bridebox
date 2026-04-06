package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AdvanceRequestResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private BigDecimal requestedAmount;
    private BigDecimal approvedAmount;
    private AdvanceStatus status;
    private LocalDateTime requestedAt;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String note;
}
