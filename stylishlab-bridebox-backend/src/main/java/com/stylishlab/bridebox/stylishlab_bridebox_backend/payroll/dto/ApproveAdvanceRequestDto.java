package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ApproveAdvanceRequestDto {
    @NotNull
    private AdvanceStatus status; // Must be APPROVED or REJECTED

    private BigDecimal approvedAmount; // Optional, required if status is APPROVED
}
