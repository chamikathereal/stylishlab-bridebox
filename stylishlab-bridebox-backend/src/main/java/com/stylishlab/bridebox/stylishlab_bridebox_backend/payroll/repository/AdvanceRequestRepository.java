package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.AdvanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdvanceRequestRepository extends JpaRepository<AdvanceRequest, Long> {

    List<AdvanceRequest> findByEmployeeId(Long employeeId);

    List<AdvanceRequest> findByStatus(AdvanceStatus status);
}
