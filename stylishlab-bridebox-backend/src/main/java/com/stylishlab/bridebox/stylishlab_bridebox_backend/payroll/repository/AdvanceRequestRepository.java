package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.AdvanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdvanceRequestRepository extends JpaRepository<AdvanceRequest, Long> {

    List<AdvanceRequest> findByEmployeeId(Long employeeId);

    List<AdvanceRequest> findByStatus(AdvanceStatus status);
    long countByStatus(AdvanceStatus status);

    @Query(value = "SELECT COALESCE(SUM(approved_amount), 0) FROM advance_requests WHERE status = 'APPROVED' AND DATE(approved_at) BETWEEN DATE(:from) AND DATE(:to)", nativeQuery = true)
    BigDecimal sumApprovedAdvancesBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query(value = "SELECT COALESCE(SUM(approved_amount), 0) FROM advance_requests WHERE status = 'APPROVED'", nativeQuery = true)
    BigDecimal sumAllApprovedAdvances();
    @Query("SELECT a FROM AdvanceRequest a WHERE " +
           "(:search IS NULL OR LOWER(a.employee.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(a.note) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:fromDate IS NULL OR a.requestedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR a.requestedAt <= :toDate)")
    org.springframework.data.domain.Page<AdvanceRequest> findAllWithFilters(
            @Param("search") String search,
            @Param("status") AdvanceStatus status,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            org.springframework.data.domain.Pageable pageable);
}
