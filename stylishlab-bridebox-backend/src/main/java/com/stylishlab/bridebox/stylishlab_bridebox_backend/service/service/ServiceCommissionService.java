package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;

import java.util.List;

public interface ServiceCommissionService {

    ServiceCommissionResponse create(CreateServiceCommissionRequest request);

    ServiceCommissionResponse update(Long id, UpdateServiceCommissionRequest request);

    void delete(Long id);

    List<ServiceCommissionResponse> getByEmployee(Long employeeId);

    List<ServiceCommissionResponse> getByService(Long serviceId);

    ServiceCommissionResponse getById(Long id);
}
