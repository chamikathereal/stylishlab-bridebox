package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.SalaryTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface SalaryTrackerRepository extends JpaRepository<SalaryTracker, Long> {

    Optional<SalaryTracker> findByEmployeeId(Long employeeId);

    @Query("SELECT SUM(s.currentSalary) FROM SalaryTracker s")
    BigDecimal sumAllCurrentSalaries();

    @Query("SELECT SUM(s.totalAdvances) FROM SalaryTracker s")
    BigDecimal sumAllTotalAdvances();

    @Query("SELECT COUNT(s) FROM SalaryTracker s WHERE s.currentSalary > 0")
    long countPendingPayments();

    @Query("SELECT s FROM SalaryTracker s WHERE " +
           "(:search IS NULL OR LOWER(s.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<SalaryTracker> findAllWithSearch(
            @org.springframework.data.repository.query.Param("search") String search,
            org.springframework.data.domain.Pageable pageable);
}
