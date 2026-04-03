package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity.MonthlyBill;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.repository.MonthlyBillRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.BillStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {

    private final MonthlyBillRepository repository;

    public BillResponse create(CreateBillRequest request) {
        MonthlyBill bill = MonthlyBill.builder()
                .billType(request.getBillType())
                .amount(request.getAmount())
                .billMonth(request.getBillMonth())
                .dueDate(request.getDueDate())
                .status(BillStatus.PENDING)
                .note(request.getNote())
                .build();
        return toResponse(repository.save(bill));
    }

    public BillResponse getById(Long id) {
        return toResponse(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id)));
    }

    public List<BillResponse> getAll() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BillResponse> getByMonth(String yearMonth) {
        return repository.findByBillMonth(yearMonth).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public BillResponse settle(Long id) {
        MonthlyBill bill = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        bill.setStatus(BillStatus.PAID);
        bill.setPaidDate(LocalDate.now());
        return toResponse(repository.save(bill));
    }

    public BillResponse update(Long id, CreateBillRequest request) {
        MonthlyBill bill = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill", "id", id));
        bill.setBillType(request.getBillType());
        bill.setAmount(request.getAmount());
        bill.setBillMonth(request.getBillMonth());
        if (request.getDueDate() != null) bill.setDueDate(request.getDueDate());
        if (request.getNote() != null) bill.setNote(request.getNote());
        return toResponse(repository.save(bill));
    }

    private BillResponse toResponse(MonthlyBill b) {
        return BillResponse.builder()
                .id(b.getId()).billType(b.getBillType())
                .amount(b.getAmount()).billMonth(b.getBillMonth())
                .dueDate(b.getDueDate()).paidDate(b.getPaidDate())
                .status(b.getStatus().name()).note(b.getNote()).build();
    }
}
