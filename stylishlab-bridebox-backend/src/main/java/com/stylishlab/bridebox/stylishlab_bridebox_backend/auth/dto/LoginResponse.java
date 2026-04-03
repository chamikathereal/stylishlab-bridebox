package com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type;
    private String role;
    private String username;
    private Long employeeId;
}
