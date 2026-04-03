package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto.*;
import java.time.LocalDate;
import java.util.List;

public interface SaleService {
    SaleResponse createSale(CreateSaleRequest request, String username);
    SaleResponse getById(Long id);
    List<SaleResponse> getAll();
    List<SaleResponse> getByEmployee(Long employeeId);
    List<SaleResponse> getByCustomer(Long customerId);
    List<SaleResponse> getByDateRange(LocalDate from, LocalDate to);
}
