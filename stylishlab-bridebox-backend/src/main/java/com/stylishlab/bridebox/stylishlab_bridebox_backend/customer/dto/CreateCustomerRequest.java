package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;
    private String mobile;
    private String notes;
}
