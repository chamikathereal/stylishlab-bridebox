package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.ServiceCommission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceCommissionRepository extends JpaRepository<ServiceCommission, Long> {

    Optional<ServiceCommission> findByEmployeeIdAndServiceId(Long employeeId, Long serviceId);

    List<ServiceCommission> findByEmployeeId(Long employeeId);

    List<ServiceCommission> findByServiceId(Long serviceId);

    void deleteByEmployeeIdAndServiceId(Long employeeId, Long serviceId);
}
