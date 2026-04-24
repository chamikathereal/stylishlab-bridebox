package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.CommissionType;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.SalonService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.ServiceCommission;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository.SalonServiceRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository.ServiceCommissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceCommissionServiceImpl implements ServiceCommissionService {

    private final ServiceCommissionRepository repository;
    private final EmployeeRepository employeeRepository;
    private final SalonServiceRepository salonServiceRepository;

    @Override
    @Transactional
    public ServiceCommissionResponse create(CreateServiceCommissionRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        SalonService service = salonServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        // Check if override already exists
        repository.findByEmployeeIdAndServiceId(request.getEmployeeId(), request.getServiceId())
                .ifPresent(existing -> {
                    throw new BadRequestException("Commission override already exists for this employee + service combination. Use update instead.");
                });

        CommissionType type = parseCommissionType(request.getCommissionType());
        validateCommissionData(type, request.getEmployeePercent(), request.getOwnerPercent(),
                request.getEmployeeFixedAmount(), request.getOwnerFixedAmount(), service.getPrice());

        ServiceCommission commission = ServiceCommission.builder()
                .employee(employee)
                .service(service)
                .commissionType(type)
                .employeePercent(type == CommissionType.PERCENTAGE ? request.getEmployeePercent() : null)
                .ownerPercent(type == CommissionType.PERCENTAGE ? request.getOwnerPercent() : null)
                .employeeFixedAmount(type == CommissionType.FIXED_AMOUNT ? request.getEmployeeFixedAmount() : null)
                .ownerFixedAmount(type == CommissionType.FIXED_AMOUNT ? request.getOwnerFixedAmount() : null)
                .build();

        return toResponse(repository.save(commission));
    }

    @Override
    @Transactional
    public ServiceCommissionResponse update(Long id, UpdateServiceCommissionRequest request) {
        ServiceCommission commission = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCommission", "id", id));

        CommissionType type = parseCommissionType(request.getCommissionType());
        validateCommissionData(type, request.getEmployeePercent(), request.getOwnerPercent(),
                request.getEmployeeFixedAmount(), request.getOwnerFixedAmount(),
                commission.getService().getPrice());

        commission.setCommissionType(type);

        if (type == CommissionType.PERCENTAGE) {
            commission.setEmployeePercent(request.getEmployeePercent());
            commission.setOwnerPercent(request.getOwnerPercent());
            commission.setEmployeeFixedAmount(null);
            commission.setOwnerFixedAmount(null);
        } else {
            commission.setEmployeeFixedAmount(request.getEmployeeFixedAmount());
            commission.setOwnerFixedAmount(request.getOwnerFixedAmount());
            commission.setEmployeePercent(null);
            commission.setOwnerPercent(null);
        }

        return toResponse(repository.save(commission));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceCommission", "id", id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ServiceCommissionResponse> getByEmployee(Long employeeId) {
        return repository.findByEmployeeId(employeeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceCommissionResponse> getByService(Long serviceId) {
        return repository.findByServiceId(serviceId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceCommissionResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCommission", "id", id)));
    }

    // --- Private helpers ---

    private CommissionType parseCommissionType(String type) {
        try {
            return CommissionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid commission type. Use PERCENTAGE or FIXED_AMOUNT");
        }
    }

    private void validateCommissionData(CommissionType type, BigDecimal empPercent, BigDecimal ownerPercent,
                                        BigDecimal empFixed, BigDecimal ownerFixed, BigDecimal servicePrice) {
        if (type == CommissionType.PERCENTAGE) {
            if (empPercent == null || ownerPercent == null) {
                throw new BadRequestException("Employee and Owner percentages are required for PERCENTAGE type");
            }
            if (empPercent.add(ownerPercent).compareTo(new BigDecimal("100")) != 0) {
                throw new BadRequestException("Employee and Owner percentages must sum to 100");
            }
        } else {
            if (empFixed == null || ownerFixed == null) {
                throw new BadRequestException("Employee and Owner fixed amounts are required for FIXED_AMOUNT type");
            }
            if (empFixed.add(ownerFixed).compareTo(servicePrice) != 0) {
                throw new BadRequestException(
                        "Employee + Owner fixed amounts must equal the service price (Rs. " + servicePrice + ")");
            }
            if (empFixed.compareTo(BigDecimal.ZERO) < 0 || ownerFixed.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Fixed amounts cannot be negative");
            }
        }
    }

    private ServiceCommissionResponse toResponse(ServiceCommission sc) {
        return ServiceCommissionResponse.builder()
                .id(sc.getId())
                .employeeId(sc.getEmployee().getId())
                .employeeName(sc.getEmployee().getFullName())
                .serviceId(sc.getService().getId())
                .serviceName(sc.getService().getServiceName())
                .servicePrice(sc.getService().getPrice())
                .commissionType(sc.getCommissionType().name())
                .employeePercent(sc.getEmployeePercent())
                .ownerPercent(sc.getOwnerPercent())
                .employeeFixedAmount(sc.getEmployeeFixedAmount())
                .ownerFixedAmount(sc.getOwnerFixedAmount())
                .build();
    }
}
