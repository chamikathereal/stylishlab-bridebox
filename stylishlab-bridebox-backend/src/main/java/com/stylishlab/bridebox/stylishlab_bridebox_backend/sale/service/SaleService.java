package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface SaleService {
    SaleResponse createSale(CreateSaleRequest request, String username);
    SaleResponse getById(Long id);
    Page<SaleResponse> getAll(String search, PaymentStatus status, Pageable pageable);
    List<SaleResponse> getByEmployee(Long employeeId);
    List<SaleResponse> getByCustomer(Long customerId);
    Page<SaleResponse> getByDateRange(LocalDate from, LocalDate to, String search, PaymentStatus status, Pageable pageable);
    List<SaleResponse> getPendingSales();
}
