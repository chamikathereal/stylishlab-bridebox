package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ServiceCommissionResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private Long serviceId;
    private String serviceName;
    private BigDecimal servicePrice;
    private String commissionType;
    private BigDecimal employeePercent;
    private BigDecimal ownerPercent;
    private BigDecimal employeeFixedAmount;
    private BigDecimal ownerFixedAmount;
}
