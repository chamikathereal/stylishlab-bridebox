package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateServiceRequest {
    private String serviceName;
    private BigDecimal price;
    private String description;
}
