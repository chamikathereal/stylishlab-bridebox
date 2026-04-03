package com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.dto.LoginRequest;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.auth.dto.LoginResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.security.JwtTokenProvider;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername()).orElseThrow();
        Long employeeId = user.getEmployee() != null ? user.getEmployee().getId() : null;

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .role(user.getRole().name())
                .username(user.getUsername())
                .employeeId(employeeId)
                .build();
    }
}
