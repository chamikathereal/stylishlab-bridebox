package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.Role;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.Status;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.EmployeeCommission;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeCommissionRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeCommissionRepository commissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(CreateEmployeeRequest request) {
        // Validate percentages sum to 100
        if (request.getEmployeePercent().add(request.getOwnerPercent()).compareTo(new BigDecimal("100")) != 0) {
            throw new BadRequestException("Employee and Owner percentages must sum to 100");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        // Create employee
        Employee employee = Employee.builder()
                .fullName(request.getFullName())
                .mobile(request.getMobile())
                .joinDate(request.getJoinDate() != null ? request.getJoinDate() : LocalDate.now())
                .status(Status.ACTIVE)
                .build();
        employee = employeeRepository.save(employee);

        // Create user account
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPLOYEE)
                .employee(employee)
                .status(Status.ACTIVE)
                .build();
        userRepository.save(user);

        // Create initial commission
        EmployeeCommission commission = EmployeeCommission.builder()
                .employee(employee)
                .employeePercent(request.getEmployeePercent())
                .ownerPercent(request.getOwnerPercent())
                .effectiveFrom(LocalDate.now())
                .build();
        commissionRepository.save(commission);

        return toResponse(employee, commission, request.getUsername());
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.getFullName() != null) employee.setFullName(request.getFullName());
        if (request.getMobile() != null) employee.setMobile(request.getMobile());

        employee = employeeRepository.save(employee);
        return toResponse(employee);
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return toResponse(employee);
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setStatus(employee.getStatus() == Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE);
        employeeRepository.save(employee);

        // Also update user account status
        userRepository.findAll().stream()
                .filter(u -> u.getEmployee() != null && u.getEmployee().getId().equals(id))
                .findFirst()
                .ifPresent(user -> {
                    user.setStatus(employee.getStatus());
                    userRepository.save(user);
                });
    }

    @Override
    @Transactional
    public CommissionResponse updateCommission(Long id, UpdateCommissionRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.getEmployeePercent().add(request.getOwnerPercent()).compareTo(new BigDecimal("100")) != 0) {
            throw new BadRequestException("Employee and Owner percentages must sum to 100");
        }

        // Close current commission
        commissionRepository.findCurrentCommission(id).ifPresent(current -> {
            current.setEffectiveTo(LocalDate.now());
            commissionRepository.save(current);
        });

        // Create new commission
        EmployeeCommission newCommission = EmployeeCommission.builder()
                .employee(employee)
                .employeePercent(request.getEmployeePercent())
                .ownerPercent(request.getOwnerPercent())
                .effectiveFrom(LocalDate.now())
                .build();
        newCommission = commissionRepository.save(newCommission);

        return toCommissionResponse(newCommission);
    }

    @Override
    @Transactional
    public void resetPassword(Long id, ResetPasswordRequest request) {
        employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        User user = userRepository.findByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User account for employee", "id", id));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    @Override
    public List<CommissionResponse> getCommissionHistory(Long employeeId) {
        return commissionRepository.findByEmployeeIdOrderByEffectiveFromDesc(employeeId).stream()
                .map(this::toCommissionResponse)
                .collect(Collectors.toList());
    }

    // --- Mapper helpers ---

    private EmployeeResponse toResponse(Employee employee) {
        var commission = commissionRepository.findCurrentCommission(employee.getId()).orElse(null);
        String username = userRepository.findAll().stream()
                .filter(u -> u.getEmployee() != null && u.getEmployee().getId().equals(employee.getId()))
                .map(User::getUsername)
                .findFirst().orElse(null);
        return toResponse(employee, commission, username);
    }

    private EmployeeResponse toResponse(Employee employee, EmployeeCommission commission, String username) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .mobile(employee.getMobile())
                .joinDate(employee.getJoinDate())
                .profilePicture(employee.getProfilePicture())
                .status(employee.getStatus().name())
                .username(username)
                .currentEmployeePercent(commission != null ? commission.getEmployeePercent() : null)
                .currentOwnerPercent(commission != null ? commission.getOwnerPercent() : null)
                .createdAt(employee.getCreatedAt())
                .build();
    }

    private CommissionResponse toCommissionResponse(EmployeeCommission c) {
        return CommissionResponse.builder()
                .id(c.getId())
                .employeeId(c.getEmployee().getId())
                .employeePercent(c.getEmployeePercent())
                .ownerPercent(c.getOwnerPercent())
                .effectiveFrom(c.getEffectiveFrom())
                .effectiveTo(c.getEffectiveTo())
                .build();
    }
}
