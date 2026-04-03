package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.Status;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByStatus(Status status);
}
