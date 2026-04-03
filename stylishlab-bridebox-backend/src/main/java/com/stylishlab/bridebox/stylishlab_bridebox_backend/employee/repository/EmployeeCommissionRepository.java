package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.EmployeeCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeCommissionRepository extends JpaRepository<EmployeeCommission, Long> {

    @Query("SELECT ec FROM EmployeeCommission ec WHERE ec.employee.id = :employeeId AND ec.effectiveTo IS NULL")
    Optional<EmployeeCommission> findCurrentCommission(@Param("employeeId") Long employeeId);

    List<EmployeeCommission> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);
}
