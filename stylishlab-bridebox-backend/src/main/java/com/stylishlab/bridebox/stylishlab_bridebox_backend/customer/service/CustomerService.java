package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.dto.*;
import java.util.List;

public interface CustomerService {
    CustomerResponse create(CreateCustomerRequest request);
    CustomerResponse update(Long id, UpdateCustomerRequest request);
    CustomerResponse getById(Long id);
    List<CustomerResponse> getAll();
    List<CustomerResponse> search(String name);
}
