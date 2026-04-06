package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByEmployeeId(Long employeeId);

    List<Sale> findByCustomerId(Long customerId);

    List<Sale> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    List<Sale> findByEmployeeIdAndCreatedAtBetween(Long employeeId, LocalDateTime from, LocalDateTime to);

    List<Sale> findByPaymentStatusIn(List<PaymentStatus> statuses);

    @Query("SELECT COALESCE(SUM(s.servicePriceSnapshot), 0) FROM Sale s WHERE s.createdAt BETWEEN :from AND :to")
    BigDecimal sumTotalSalesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.ownerAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :from AND :to")
    BigDecimal sumOwnerAmountBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.employeeAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :from AND :to")
    BigDecimal sumEmployeeAmountBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.paidAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :from AND :to")
    BigDecimal sumPaidAmountBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.dueAmount), 0) FROM Sale s WHERE s.createdAt BETWEEN :from AND :to")
    BigDecimal sumDueAmountBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.employeeAmount), 0) FROM Sale s WHERE s.employee.id = :empId AND s.createdAt BETWEEN :from AND :to")
    BigDecimal sumEmployeeEarnings(@Param("empId") Long employeeId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.employee.id = :empId AND s.createdAt BETWEEN :from AND :to")
    Long countServicesByEmployee(@Param("empId") Long employeeId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(s.servicePriceSnapshot), 0) FROM Sale s")
    BigDecimal sumTotalSales();

    @Query("SELECT COALESCE(SUM(s.ownerAmount), 0) FROM Sale s")
    BigDecimal sumOwnerAmount();

    @Query("SELECT COALESCE(SUM(s.employeeAmount), 0) FROM Sale s")
    BigDecimal sumEmployeeAmount();

    @Query("SELECT COALESCE(SUM(s.paidAmount), 0) FROM Sale s")
    BigDecimal sumPaidAmount();

    @Query("SELECT COALESCE(SUM(s.dueAmount), 0) FROM Sale s")
    BigDecimal sumDueAmount();

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}
