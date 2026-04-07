package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.dto.*;

import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(CreateEmployeeRequest request);
    EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request);
    EmployeeResponse getEmployeeById(Long id);
    List<EmployeeResponse> getAllEmployees();
    void toggleStatus(Long id);
    CommissionResponse updateCommission(Long id, UpdateCommissionRequest request);
    List<CommissionResponse> getCommissionHistory(Long employeeId);
    void resetPassword(Long id, ResetPasswordRequest request);
}
