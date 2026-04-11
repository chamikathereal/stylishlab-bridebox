package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findBySettledAtBetween(LocalDateTime from, LocalDateTime to);

    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId AND p.settledAt BETWEEN :from AND :to")
    List<Payroll> findByEmployeeIdAndDateRange(@Param("employeeId") Long employeeId,
                                               @Param("from") LocalDateTime from,
                                               @Param("to") LocalDateTime to);

    @Query(value = "SELECT COALESCE(SUM(net_paid), 0) FROM payrolls WHERE DATE(settled_at) BETWEEN DATE(:from) AND DATE(:to)", nativeQuery = true)
    BigDecimal sumNetPaidBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT COALESCE(SUM(net_paid), 0) FROM payrolls", nativeQuery = true)
    BigDecimal sumAllNetPaid();
}
