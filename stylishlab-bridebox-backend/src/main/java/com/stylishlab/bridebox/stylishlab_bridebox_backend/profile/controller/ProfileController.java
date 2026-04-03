package com.stylishlab.bridebox.stylishlab_bridebox_backend.profile.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.profile.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Tag(name = "Profile Management", description = "Manage personal profile, password, and picture")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(profileService.getProfile(auth.getName())));
    }

    @PutMapping
    @Operation(summary = "Update my profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @RequestBody UpdateProfileRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Profile updated", profileService.updateProfile(auth.getName(), request)));
    }

    @PutMapping("/password")
    @Operation(summary = "Change password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request, Authentication auth) {
        profileService.changePassword(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @PostMapping(value = "/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile picture")
    public ResponseEntity<ApiResponse<ProfileResponse>> uploadPicture(
            @RequestParam("file") MultipartFile file, Authentication auth) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok("Picture uploaded", profileService.uploadProfilePicture(auth.getName(), file)));
    }
}
