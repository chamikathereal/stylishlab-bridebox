package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByEmployeeId(Long employeeId);

    List<Sale> findByCustomerId(Long customerId);

    @Query("SELECT s FROM Sale s WHERE " +
           "LOWER(s.invoiceNo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customer.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.serviceNameSnapshot) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Sale> findAllWithSearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE " +
           "(LOWER(s.invoiceNo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.customer.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.serviceNameSnapshot) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "s.createdAt BETWEEN :from AND :to")
    Page<Sale> findByCreatedAtBetweenWithSearch(@Param("search") String search, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to, Pageable pageable);

    Page<Sale> findByCreatedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

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
