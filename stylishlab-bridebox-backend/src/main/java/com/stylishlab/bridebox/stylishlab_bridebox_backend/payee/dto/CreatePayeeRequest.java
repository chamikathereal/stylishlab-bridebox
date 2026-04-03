package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePayeeRequest {
    @NotBlank(message = "Name is required")
    private String name;
    @NotBlank(message = "Type is required")
    private String type;
    private String mobile;
    private String notes;
}
