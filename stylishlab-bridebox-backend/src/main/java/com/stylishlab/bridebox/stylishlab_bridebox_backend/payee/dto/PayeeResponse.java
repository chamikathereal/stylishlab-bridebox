package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PayeeResponse {
    private Long id;
    private String name;
    private String type;
    private String mobile;
    private String notes;
    private Boolean isActive;
}
