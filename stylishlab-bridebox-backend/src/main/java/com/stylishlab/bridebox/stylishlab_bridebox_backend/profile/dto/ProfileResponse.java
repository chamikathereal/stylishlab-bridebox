package com.stylishlab.bridebox.stylishlab_bridebox_backend.profile.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProfileResponse {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private Long employeeId;
    private String fullName;
    private String mobile;
    private String profilePicture;
}
