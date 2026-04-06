package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.task;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.Payroll;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.SalaryTracker;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.PayrollRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.SalaryTrackerRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Robust data backfill task that runs on application startup.
 * It ensures all SalaryTracker entities correctly reflect the sum of all historical sales
 * minus the sum of all settled payrolls for each employee.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SalaryTrackerBackfillTask implements ApplicationRunner {

    private final EmployeeRepository employeeRepository;
    private final SaleRepository saleRepository;
    private final PayrollRepository payrollRepository;
    private final SalaryTrackerRepository trackerRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Starting SalaryTracker reconciliation backfill task...");
        
        List<Employee> employees = employeeRepository.findAll();
        int updatedCount = 0;

        for (Employee employee : employees) {
            try {
                processEmployeeReconciliation(employee);
                updatedCount++;
            } catch (Exception e) {
                log.error("Failed to reconcile salary for employee ID: {}. Error: {}", employee.getId(), e.getMessage());
            }
        }

        log.info("SalaryTracker reconciliation complete. Processed {} employees.", updatedCount);
    }

    private void processEmployeeReconciliation(Employee employee) {
        // 1. Get ALL historical sales commissions for this employee
        List<Sale> allSales = saleRepository.findByEmployeeId(employee.getId());
        BigDecimal totalCommissions = allSales.stream()
                .map(s -> s.getEmployeeAmount() != null ? s.getEmployeeAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Get ALL historical payroll settlements for this employee
        List<Payroll> allPayrolls = payrollRepository.findByEmployeeId(employee.getId());
        BigDecimal totalSettled = allPayrolls.stream()
                .map(p -> p.getTotalEarnings() != null ? p.getTotalEarnings() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Mathematical Pending Balance = Commissions - Settlements
        BigDecimal pendingBalance = totalCommissions.subtract(totalSettled);
        
        // Ensure balance is at least ZERO (never negative)
        if (pendingBalance.compareTo(BigDecimal.ZERO) < 0) {
            log.warn("Calculated negative balance ({}) for employee {}. Setting to 0.", pendingBalance, employee.getFullName());
            pendingBalance = BigDecimal.ZERO;
        }

        // 4. Update or Create SalaryTracker
        SalaryTracker tracker = trackerRepository.findByEmployeeId(employee.getId())
                .orElse(SalaryTracker.builder()
                        .employee(employee)
                        .totalAdvances(BigDecimal.ZERO)
                        .build());

        // Update the current salary tracking field
        tracker.setCurrentSalary(pendingBalance);
        
        trackerRepository.save(tracker);
        
        log.debug("Reconciled {}: Commissions={}, Settled={}, Pending={}", 
                employee.getFullName(), totalCommissions, totalSettled, pendingBalance);
    }
}
