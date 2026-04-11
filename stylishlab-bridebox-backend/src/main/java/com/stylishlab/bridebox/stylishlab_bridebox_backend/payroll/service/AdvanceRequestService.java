package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.AdvanceRequestResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.ApproveAdvanceRequestDto;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.CreateAdvanceRequestDto;

import java.util.List;

public interface AdvanceRequestService {

    AdvanceRequestResponse createRequest(Long employeeId, CreateAdvanceRequestDto request);

    AdvanceRequestResponse processRequest(Long requestId, ApproveAdvanceRequestDto request, String adminUsername);

    List<AdvanceRequestResponse> getRequestsByEmployee(Long employeeId);

    org.springframework.data.domain.Page<AdvanceRequestResponse> getAllRequests(
            String search, com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus status,
            java.time.LocalDateTime fromDate, java.time.LocalDateTime toDate,
            org.springframework.data.domain.Pageable pageable);

    List<AdvanceRequestResponse> getRequestsByStatus(AdvanceStatus status);
}
