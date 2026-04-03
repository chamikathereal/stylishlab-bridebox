package com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.dto.LoginRequest;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.dto.LoginResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.service.AuthService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and token management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate with username and password to get JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}
