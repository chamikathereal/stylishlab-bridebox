package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto;

import lombok.Data;

@Data
public class UpdatePayeeRequest {
    private String name;
    private String type;
    private String mobile;
    private String notes;
}
