package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity.MonthlyBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MonthlyBillRepository extends JpaRepository<MonthlyBill, Long> {
    List<MonthlyBill> findByBillMonth(String billMonth);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM MonthlyBill b WHERE b.billMonth = :month")
    BigDecimal sumBillsByMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM MonthlyBill b WHERE b.paidDate >= :from AND b.paidDate <= :to AND b.status = 'PAID'")
    BigDecimal sumBillsPaidBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(b.amount), 0) FROM MonthlyBill b")
    BigDecimal sumAllBills();
}
