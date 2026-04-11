package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.entity.Payee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.repository.PayeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayeeService {

    private final PayeeRepository repository;

    public PayeeResponse create(CreatePayeeRequest request) {
        Payee payee = Payee.builder()
                .name(request.getName()).type(request.getType())
                .mobile(request.getMobile()).notes(request.getNotes())
                .isActive(true).build();
        return toResponse(repository.save(payee));
    }

    public PayeeResponse update(Long id, UpdatePayeeRequest request) {
        Payee payee = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payee", "id", id));
        if (request.getName() != null) payee.setName(request.getName());
        if (request.getType() != null) payee.setType(request.getType());
        if (request.getMobile() != null) payee.setMobile(request.getMobile());
        if (request.getNotes() != null) payee.setNotes(request.getNotes());
        return toResponse(repository.save(payee));
    }

    public List<PayeeResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PayeeResponse> getActive() {
        return repository.findByIsActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PayeeResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payee", "id", id)));
    }

    public void toggleStatus(Long id) {
        Payee payee = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payee", "id", id));
        payee.setIsActive(!payee.getIsActive());
        repository.save(payee);
    }

    public List<PayeeTypeResponse> getPayeeTypes() {
        return java.util.Arrays.stream(com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PayeeType.values())
                .map(type -> PayeeTypeResponse.builder()
                        .value(type.name())
                        .displayName(type.getDisplayName())
                        .build())
                .collect(Collectors.toList());
    }

    private PayeeResponse toResponse(Payee p) {
        return PayeeResponse.builder()
                .id(p.getId()).name(p.getName()).type(p.getType())
                .mobile(p.getMobile()).notes(p.getNotes())
                .isActive(p.getIsActive()).build();
    }
}
