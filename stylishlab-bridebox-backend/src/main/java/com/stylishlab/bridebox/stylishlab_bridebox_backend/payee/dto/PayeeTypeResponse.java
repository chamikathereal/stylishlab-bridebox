package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayeeTypeResponse {
    private String value;
    private String displayName;
}
