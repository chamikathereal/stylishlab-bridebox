package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.SalonService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository.SalonServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonServiceServiceImpl implements SalonServiceService {

    private final SalonServiceRepository repository;

    @Override
    public ServiceResponse create(CreateServiceRequest request) {
        SalonService service = SalonService.builder()
                .serviceName(request.getServiceName())
                .price(request.getPrice())
                .description(request.getDescription())
                .isActive(true)
                .build();
        return toResponse(repository.save(service));
    }

    @Override
    public ServiceResponse update(Long id, UpdateServiceRequest request) {
        SalonService service = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        if (request.getServiceName() != null) service.setServiceName(request.getServiceName());
        if (request.getPrice() != null) service.setPrice(request.getPrice());
        if (request.getDescription() != null) service.setDescription(request.getDescription());
        return toResponse(repository.save(service));
    }

    @Override
    public ServiceResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id)));
    }

    @Override
    public List<ServiceResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<ServiceResponse> getActive() {
        return repository.findByIsActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public void toggleStatus(Long id) {
        SalonService service = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        service.setIsActive(!service.getIsActive());
        repository.save(service);
    }

    private ServiceResponse toResponse(SalonService s) {
        return ServiceResponse.builder()
                .id(s.getId()).serviceName(s.getServiceName())
                .price(s.getPrice()).description(s.getDescription())
                .isActive(s.getIsActive()).build();
    }
}
