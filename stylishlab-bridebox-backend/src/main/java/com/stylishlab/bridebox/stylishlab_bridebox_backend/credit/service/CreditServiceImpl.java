package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.entity.CreditPayment;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.repository.CreditPaymentRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository.SaleRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditServiceImpl implements CreditService {

    private final CreditPaymentRepository creditPaymentRepository;
    private final SaleRepository saleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public CreditPaymentResponse recordPayment(Long saleId, RecordCreditPaymentRequest request, String username) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", saleId));

        if (sale.getDueAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("This sale has no outstanding balance");
        }

        if (request.getAmountPaid().compareTo(sale.getDueAmount()) > 0) {
            throw new BadRequestException("Payment amount exceeds due amount of " + sale.getDueAmount());
        }

        User recordedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Record credit payment
        CreditPayment payment = CreditPayment.builder()
                .sale(sale)
                .customer(sale.getCustomer())
                .amountPaid(request.getAmountPaid())
                .recordedBy(recordedBy)
                .note(request.getNote())
                .build();
        payment = creditPaymentRepository.save(payment);

        // Update sale amounts
        sale.setPaidAmount(sale.getPaidAmount().add(request.getAmountPaid()));
        sale.setDueAmount(sale.getDueAmount().subtract(request.getAmountPaid()));

        if (sale.getDueAmount().compareTo(BigDecimal.ZERO) <= 0) {
            sale.setPaymentStatus(PaymentStatus.FULLY_PAID);
        } else {
            sale.setPaymentStatus(PaymentStatus.PARTIAL);
        }
        saleRepository.save(sale);

        return toResponse(payment);
    }

    @Override
    public List<CustomerCreditSummaryResponse> getPendingCredits() {
        List<Sale> creditSales = saleRepository.findByPaymentStatusIn(
                List.of(PaymentStatus.CREDIT, PaymentStatus.PARTIAL));

        Map<Long, List<Sale>> byCustomer = creditSales.stream()
                .filter(s -> s.getDueAmount().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.groupingBy(s -> s.getCustomer().getId()));

        return byCustomer.entrySet().stream().map(entry -> {
            List<Sale> sales = entry.getValue();
            Sale first = sales.get(0);
            BigDecimal totalDue = sales.stream()
                    .map(Sale::getDueAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            return CustomerCreditSummaryResponse.builder()
                    .customerId(first.getCustomer().getId())
                    .customerName(first.getCustomer().getCustomerName())
                    .totalDue(totalDue)
                    .pendingSalesCount((long) sales.size())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<CreditPaymentResponse> getCreditHistoryForSale(Long saleId) {
        return creditPaymentRepository.findBySaleId(saleId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<CreditPaymentResponse> getCreditHistoryForCustomer(Long customerId) {
        return creditPaymentRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    private CreditPaymentResponse toResponse(CreditPayment cp) {
        return CreditPaymentResponse.builder()
                .id(cp.getId())
                .saleId(cp.getSale().getId())
                .invoiceNo(cp.getSale().getInvoiceNo())
                .customerId(cp.getCustomer().getId())
                .customerName(cp.getCustomer().getCustomerName())
                .amountPaid(cp.getAmountPaid())
                .paidAt(cp.getPaidAt())
                .recordedByUsername(cp.getRecordedBy().getUsername())
                .note(cp.getNote())
                .build();
    }
}
