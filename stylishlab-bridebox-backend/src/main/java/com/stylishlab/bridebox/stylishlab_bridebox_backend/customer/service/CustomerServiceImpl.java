package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.entity.Customer;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;

    @Override
    public CustomerResponse create(CreateCustomerRequest request) {
        Customer customer = Customer.builder()
                .customerName(request.getCustomerName())
                .mobile(request.getMobile())
                .notes(request.getNotes())
                .build();
        return toResponse(repository.save(customer));
    }

    @Override
    public CustomerResponse update(Long id, UpdateCustomerRequest request) {
        Customer customer = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        if (request.getCustomerName() != null) customer.setCustomerName(request.getCustomerName());
        if (request.getMobile() != null) customer.setMobile(request.getMobile());
        if (request.getNotes() != null) customer.setNotes(request.getNotes());
        return toResponse(repository.save(customer));
    }

    @Override
    public CustomerResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id)));
    }

    @Override
    public List<CustomerResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CustomerResponse> search(String name) {
        return repository.findByCustomerNameContainingIgnoreCase(name).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private CustomerResponse toResponse(Customer c) {
        return CustomerResponse.builder()
                .id(c.getId()).customerName(c.getCustomerName())
                .mobile(c.getMobile()).notes(c.getNotes())
                .createdAt(c.getCreatedAt()).build();
    }
}
