package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EmployeeResponse {
    private Long id;
    private String fullName;
    private String mobile;
    private LocalDate joinDate;
    private String profilePicture;
    private String status;
    private String username;
    private BigDecimal currentEmployeePercent;
    private BigDecimal currentOwnerPercent;
    private LocalDateTime createdAt;
}
