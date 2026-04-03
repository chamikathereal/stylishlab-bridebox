package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto;

import lombok.Data;

@Data
public class UpdateCustomerRequest {
    private String customerName;
    private String mobile;
    private String notes;
}
