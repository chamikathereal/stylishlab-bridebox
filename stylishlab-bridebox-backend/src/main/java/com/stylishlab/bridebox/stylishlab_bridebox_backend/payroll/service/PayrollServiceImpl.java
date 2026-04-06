package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.AdminPayrollStatsResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.PayrollResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.SalaryTrackerResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.dto.SettleSalaryRequest;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.Payroll;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity.SalaryTracker;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.PayrollRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.SalaryTrackerRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

    private final PayrollRepository payrollRepository;
    private final SalaryTrackerRepository trackerRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void addCommissionToTracker(Long employeeId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return;

        SalaryTracker tracker = trackerRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> createDefaultTracker(employeeId));

        tracker.setCurrentSalary(tracker.getCurrentSalary().add(amount));
        trackerRepository.save(tracker);
    }

    @Override
    public SalaryTrackerResponse getTrackerByEmployee(Long employeeId) {
        SalaryTracker tracker = trackerRepository.findByEmployeeId(employeeId)
                .orElseGet(() -> createDefaultTracker(employeeId));
        return toTrackerResponse(tracker);
    }

    @Override
    public List<SalaryTrackerResponse> getAllTrackers() {
        return trackerRepository.findAll().stream()
                .map(this::toTrackerResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AdminPayrollStatsResponse getAdminStats() {
        BigDecimal totalPending = trackerRepository.sumAllCurrentSalaries();
        BigDecimal totalAdvances = trackerRepository.sumAllTotalAdvances();
        long pendingCount = trackerRepository.countPendingPayments();

        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = YearMonth.now().atEndOfMonth().atTime(LocalTime.MAX);
        
        List<Payroll> monthPayrolls = payrollRepository.findBySettledAtBetween(startOfMonth, endOfMonth);
        BigDecimal totalPaidThisMonth = monthPayrolls.stream()
                .map(Payroll::getNetPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AdminPayrollStatsResponse.builder()
                .totalPendingSalary(totalPending != null ? totalPending : BigDecimal.ZERO)
                .totalPaidThisMonth(totalPaidThisMonth)
                .totalAdvancesGiven(totalAdvances != null ? totalAdvances : BigDecimal.ZERO)
                .employeesPendingPaymentCount(pendingCount)
                .build();
    }

    @Override
    @Transactional
    public PayrollResponse settleSalary(SettleSalaryRequest request, String adminUsername) {
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", adminUsername));

        SalaryTracker tracker = trackerRepository.findByEmployeeId(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("SalaryTracker", "employeeId", request.getEmployeeId()));

        BigDecimal totalEarnings = tracker.getCurrentSalary();
        BigDecimal totalAdvances = tracker.getTotalAdvances();
        BigDecimal netPaid = totalEarnings.subtract(totalAdvances);

        if (totalEarnings.compareTo(BigDecimal.ZERO) == 0 && totalAdvances.compareTo(BigDecimal.ZERO) == 0) {
            throw new BadRequestException("No pending salary to settle");
        }

        Payroll payroll = Payroll.builder()
                .employee(tracker.getEmployee())
                .totalEarnings(totalEarnings)
                .totalAdvances(totalAdvances)
                .netPaid(netPaid)
                .settledBy(admin)
                .note(request.getNote())
                .build();

        payroll = payrollRepository.save(payroll);

        // Reset tracker
        tracker.setCurrentSalary(BigDecimal.ZERO);
        tracker.setTotalAdvances(BigDecimal.ZERO);
        tracker.setLastSettlementDate(LocalDateTime.now());
        trackerRepository.save(tracker);

        return toPayrollResponse(payroll);
    }

    @Override
    public List<PayrollResponse> getPayrollHistoryByEmployee(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId).stream()
                .map(this::toPayrollResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PayrollResponse> getPayrollHistoryByDateRange(LocalDate from, LocalDate to) {
        return payrollRepository.findBySettledAtBetween(from.atStartOfDay(), to.atTime(LocalTime.MAX)).stream()
                .map(this::toPayrollResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PayrollResponse> getAllPayrollHistory() {
        return payrollRepository.findAll().stream()
                .map(this::toPayrollResponse)
                .collect(Collectors.toList());
    }

    private SalaryTracker createDefaultTracker(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        SalaryTracker t = SalaryTracker.builder()
                .employee(employee)
                .currentSalary(BigDecimal.ZERO)
                .totalAdvances(BigDecimal.ZERO)
                .build();
        return trackerRepository.save(t);
    }

    private SalaryTrackerResponse toTrackerResponse(SalaryTracker s) {
        BigDecimal netPayable = s.getCurrentSalary().subtract(s.getTotalAdvances());
        return SalaryTrackerResponse.builder()
                .id(s.getId())
                .employeeId(s.getEmployee().getId())
                .employeeName(s.getEmployee().getFullName())
                .currentSalary(s.getCurrentSalary())
                .totalAdvances(s.getTotalAdvances())
                .lastSettlementDate(s.getLastSettlementDate())
                .netPayable(netPayable)
                .build();
    }

    private PayrollResponse toPayrollResponse(Payroll p) {
        return PayrollResponse.builder()
                .id(p.getId())
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFullName())
                .totalEarnings(p.getTotalEarnings())
                .totalAdvances(p.getTotalAdvances())
                .netPaid(p.getNetPaid())
                .settledById(p.getSettledBy().getId())
                .settledByName(p.getSettledBy().getUsername())
                .settledAt(p.getSettledAt())
                .note(p.getNote())
                .build();
    }
}
