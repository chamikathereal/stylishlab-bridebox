package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.AdvanceRequestResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.ApproveAdvanceRequestDto;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.CreateAdvanceRequestDto;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.AdvanceRequest;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.SalaryTracker;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.AdvanceRequestRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.SalaryTrackerRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvanceRequestServiceImpl implements AdvanceRequestService {

    private final AdvanceRequestRepository advanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryTrackerRepository trackerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AdvanceRequestResponse createRequest(Long employeeId, CreateAdvanceRequestDto request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        SalaryTracker tracker = trackerRepository.findByEmployeeId(employeeId).orElse(null);
        BigDecimal currentPending = tracker != null ? tracker.getCurrentSalary().subtract(tracker.getTotalAdvances()) : BigDecimal.ZERO;

        if (request.getRequestedAmount().compareTo(currentPending) > 0) {
            throw new BadRequestException("Requested amount exceeds pending salary limit (Pending: " + currentPending + ")");
        }

        AdvanceRequest ar = AdvanceRequest.builder()
                .employee(employee)
                .requestedAmount(request.getRequestedAmount())
                .status(AdvanceStatus.PENDING)
                .note(request.getNote())
                .build();

        return toResponse(advanceRepository.save(ar));
    }

    @Override
    @Transactional
    public AdvanceRequestResponse processRequest(Long requestId, ApproveAdvanceRequestDto request, String adminUsername) {
        AdvanceRequest ar = advanceRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("AdvanceRequest", "id", requestId));

        if (ar.getStatus() != AdvanceStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be processed");
        }

        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        if (request.getStatus() == AdvanceStatus.APPROVED) {
            if (request.getApprovedAmount() == null || request.getApprovedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Approved amount is required and must be greater than zero");
            }

            SalaryTracker tracker = trackerRepository.findByEmployeeId(ar.getEmployee().getId())
                    .orElseThrow(() -> new BadRequestException("No active salary tracker found for employee"));

            BigDecimal currentPending = tracker.getCurrentSalary().subtract(tracker.getTotalAdvances());
            if (request.getApprovedAmount().compareTo(currentPending) > 0) {
                throw new BadRequestException("Approved amount cannot exceed the pending limit (Pending: " + currentPending + ")");
            }

            ar.setApprovedAmount(request.getApprovedAmount());
            tracker.setTotalAdvances(tracker.getTotalAdvances().add(request.getApprovedAmount()));
            trackerRepository.save(tracker);
        }

        ar.setStatus(request.getStatus());
        ar.setApprovedBy(admin);
        ar.setApprovedAt(LocalDateTime.now());

        return toResponse(advanceRepository.save(ar));
    }

    @Override
    public List<AdvanceRequestResponse> getRequestsByEmployee(Long employeeId) {
        return advanceRepository.findByEmployeeId(employeeId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public org.springframework.data.domain.Page<AdvanceRequestResponse> getAllRequests(
            String search, AdvanceStatus status,
            LocalDateTime fromDate, LocalDateTime toDate,
            org.springframework.data.domain.Pageable pageable) {
        return advanceRepository.findAllWithFilters(search, status, fromDate, toDate, pageable)
                .map(this::toResponse);
    }

    @Override
    public List<AdvanceRequestResponse> getRequestsByStatus(AdvanceStatus status) {
        return advanceRepository.findByStatus(status).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private AdvanceRequestResponse toResponse(AdvanceRequest ar) {
        return AdvanceRequestResponse.builder()
                .id(ar.getId())
                .employeeId(ar.getEmployee().getId())
                .employeeName(ar.getEmployee().getFullName())
                .requestedAmount(ar.getRequestedAmount())
                .approvedAmount(ar.getApprovedAmount())
                .status(ar.getStatus())
                .requestedAt(ar.getRequestedAt())
                .approvedById(ar.getApprovedBy() != null ? ar.getApprovedBy().getId() : null)
                .approvedByName(ar.getApprovedBy() != null ? ar.getApprovedBy().getUsername() : null)
                .approvedAt(ar.getApprovedAt())
                .note(ar.getNote())
                .build();
    }
}
