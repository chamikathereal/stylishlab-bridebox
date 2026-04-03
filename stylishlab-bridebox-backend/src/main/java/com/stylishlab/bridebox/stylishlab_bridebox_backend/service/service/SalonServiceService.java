package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;
import java.util.List;

public interface SalonServiceService {
    ServiceResponse create(CreateServiceRequest request);
    ServiceResponse update(Long id, UpdateServiceRequest request);
    ServiceResponse getById(Long id);
    List<ServiceResponse> getAll();
    List<ServiceResponse> getActive();
    void toggleStatus(Long id);
}
