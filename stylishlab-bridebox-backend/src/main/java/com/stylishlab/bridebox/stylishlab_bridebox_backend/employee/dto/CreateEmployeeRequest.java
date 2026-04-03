package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateEmployeeRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    private String mobile;

    private LocalDate joinDate;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Employee commission percentage is required")
    @DecimalMin(value = "0", message = "Employee percent must be >= 0")
    @DecimalMax(value = "100", message = "Employee percent must be <= 100")
    private BigDecimal employeePercent;

    @NotNull(message = "Owner commission percentage is required")
    @DecimalMin(value = "0", message = "Owner percent must be >= 0")
    @DecimalMax(value = "100", message = "Owner percent must be <= 100")
    private BigDecimal ownerPercent;
}
