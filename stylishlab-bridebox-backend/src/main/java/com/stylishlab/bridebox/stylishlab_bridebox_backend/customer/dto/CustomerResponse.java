package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String customerName;
    private String mobile;
    private String notes;
    private LocalDateTime createdAt;
}
