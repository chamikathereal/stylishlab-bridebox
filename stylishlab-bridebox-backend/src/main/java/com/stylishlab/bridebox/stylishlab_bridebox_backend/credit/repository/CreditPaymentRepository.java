package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.entity.CreditPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditPaymentRepository extends JpaRepository<CreditPayment, Long> {
    List<CreditPayment> findBySaleId(Long saleId);
    List<CreditPayment> findByCustomerId(Long customerId);
}
