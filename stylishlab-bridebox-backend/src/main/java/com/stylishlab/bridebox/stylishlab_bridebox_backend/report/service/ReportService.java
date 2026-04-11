package com.stylishlab.bridebox.stylishlab_bridebox_backend.report.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.repository.MonthlyBillRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.AdvanceStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository.ExpenseRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.AdvanceRequestRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.repository.PayrollRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto.EmployeeEarningsResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.report.dto.PeriodReportResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository.SaleRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;
    private final MonthlyBillRepository billRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PayrollRepository payrollRepository;
    private final AdvanceRequestRepository advanceRepository;

    public PeriodReportResponse getDailyReport(LocalDate date) {
        LocalDateTime from = date.atStartOfDay();
        LocalDateTime to = date.atTime(LocalTime.MAX);
        return buildReport(date.toString(), from, to, date, date);
    }

    public PeriodReportResponse getWeeklyReport(LocalDate date) {
        LocalDate weekStart = date.with(DayOfWeek.MONDAY);
        LocalDate weekEnd = date.with(DayOfWeek.SUNDAY);
        LocalDateTime from = weekStart.atStartOfDay();
        LocalDateTime to = weekEnd.atTime(LocalTime.MAX);
        return buildReport(weekStart + " to " + weekEnd, from, to, weekStart, weekEnd);
    }

    public PeriodReportResponse getMonthlyReport(String yearMonth) {
        YearMonth ym = YearMonth.parse(yearMonth, DateTimeFormatter.ofPattern("yyyy-MM"));
        LocalDate monthStart = ym.atDay(1);
        LocalDate monthEnd = ym.atEndOfMonth();
        LocalDateTime from = monthStart.atStartOfDay();
        LocalDateTime to = monthEnd.atTime(LocalTime.MAX);

        PeriodReportResponse report = buildReport(yearMonth, from, to, monthStart, monthEnd);

        // Add monthly bills (re-calculating netProfit correctly)
        BigDecimal totalBills = billRepository.sumBillsByMonth(yearMonth);
        report.setTotalBills(totalBills);
        
        // Correctly calculate netProfit including all components from buildReport plus totalBills
        report.setNetProfit(report.getOwnerRevenue()
                .subtract(report.getTotalExpenses())
                .subtract(totalBills));

        return report;
    }

    public PeriodReportResponse getYearlyReport(int year) {
        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);
        LocalDateTime from = yearStart.atStartOfDay();
        LocalDateTime to = yearEnd.atTime(LocalTime.MAX);

        PeriodReportResponse report = buildReport(String.valueOf(year), from, to, yearStart, yearEnd);

        // Sum all bills for the year
        BigDecimal totalBills = BigDecimal.ZERO;
        for (int m = 1; m <= 12; m++) {
            String month = String.format("%d-%02d", year, m);
            totalBills = totalBills.add(billRepository.sumBillsByMonth(month));
        }
        report.setTotalBills(totalBills);
        
        // Correctly calculate netProfit
        report.setNetProfit(report.getOwnerRevenue()
                .subtract(report.getTotalExpenses())
                .subtract(totalBills));

        return report;
    }

    public PeriodReportResponse getTotalReport() {
        BigDecimal totalSales = saleRepository.sumTotalSales();
        BigDecimal cashReceived = saleRepository.sumPaidAmount();
        BigDecimal creditSales = saleRepository.sumDueAmount();
        BigDecimal employeeCommissions = saleRepository.sumEmployeeAmount();
        BigDecimal ownerRevenue = saleRepository.sumOwnerAmount();
        BigDecimal totalExpenses = expenseRepository.sumAllExpenses();
        BigDecimal totalBills = billRepository.sumAllBills();
        BigDecimal totalPaidBills = billRepository.sumPaidBillsTotal();

        // New: Include salaries and advances in totals
        BigDecimal totalSalariesPaid = payrollRepository.sumAllNetPaid()
                .add(advanceRepository.sumAllApprovedAdvances());

        // Employee Commissions Debt = Total Earned - Already Paid
        BigDecimal outstandingCommissions = (employeeCommissions != null ? employeeCommissions : BigDecimal.ZERO)
                .subtract(totalSalariesPaid);

        BigDecimal netProfit = (ownerRevenue != null ? ownerRevenue : BigDecimal.ZERO)
                .subtract(totalExpenses)
                .subtract(totalBills);
        BigDecimal realizedProfit = (cashReceived != null ? cashReceived : BigDecimal.ZERO)
                .subtract(totalSalariesPaid)
                .subtract(totalExpenses)
                .subtract(totalPaidBills);

        return PeriodReportResponse.builder()
                .period("Total")
                .totalTransactions(saleRepository.count())
                .totalSales(totalSales)
                .cashReceived(cashReceived)
                .creditSales(creditSales)
                .employeeCommissions(outstandingCommissions)
                .totalExpenses(totalExpenses)
                .totalBills(totalBills)
                .totalSalariesPaid(totalSalariesPaid)
                .ownerRevenue(ownerRevenue)
                .netProfit(netProfit)
                .realizedProfit(realizedProfit)
                .build();
    }

    public EmployeeEarningsResponse getEmployeeEarnings(Long employeeId, LocalDate date) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        LocalDateTime targetStart = targetDate.atStartOfDay();
        LocalDateTime targetEnd = targetDate.atTime(LocalTime.MAX);

        LocalDate weekStart = targetDate.with(DayOfWeek.MONDAY);
        LocalDateTime weekStartDt = weekStart.atStartOfDay();

        LocalDate monthStart = targetDate.with(TemporalAdjusters.firstDayOfMonth());
        LocalDateTime monthStartDt = monthStart.atStartOfDay();

        LocalDate yearStart = targetDate.with(TemporalAdjusters.firstDayOfYear());
        LocalDateTime yearStartDt = yearStart.atStartOfDay();

        return EmployeeEarningsResponse.builder()
                .employeeId(employeeId)
                .employeeName(employee.getFullName())
                .todayEarnings(saleRepository.sumEmployeeEarnings(employeeId, targetStart, targetEnd))
                .todayServices(saleRepository.countServicesByEmployee(employeeId, targetStart, targetEnd))
                .weekEarnings(saleRepository.sumEmployeeEarnings(employeeId, weekStartDt, targetEnd))
                .weekServices(saleRepository.countServicesByEmployee(employeeId, weekStartDt, targetEnd))
                .monthEarnings(saleRepository.sumEmployeeEarnings(employeeId, monthStartDt, targetEnd))
                .monthServices(saleRepository.countServicesByEmployee(employeeId, monthStartDt, targetEnd))
                .yearEarnings(saleRepository.sumEmployeeEarnings(employeeId, yearStartDt, targetEnd))
                .yearServices(saleRepository.countServicesByEmployee(employeeId, yearStartDt, targetEnd))
                .build();
    }

    public EmployeeEarningsResponse getMyEarnings(String username, LocalDate date) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        if (user.getEmployee() == null) {
            throw new ResourceNotFoundException("Employee profile not found for user: " + username);
        }
        return getEmployeeEarnings(user.getEmployee().getId(), date);
    }

    // --- Private helper ---

    private PeriodReportResponse buildReport(String period, LocalDateTime from, LocalDateTime to,
                                              LocalDate expFrom, LocalDate expTo) {
        BigDecimal totalSales = saleRepository.sumTotalSalesBetween(from, to);
        BigDecimal cashReceived = saleRepository.sumPaidAmountBetween(from, to);
        BigDecimal creditSales = saleRepository.sumDueAmountBetween(from, to);
        BigDecimal employeeCommissions = saleRepository.sumEmployeeAmountBetween(from, to);
        BigDecimal ownerRevenue = saleRepository.sumOwnerAmountBetween(from, to);
        BigDecimal totalExpenses = expenseRepository.sumExpensesBetween(expFrom, expTo);
        BigDecimal totalBillsPaid = billRepository.sumBillsPaidBetween(expFrom, expTo);

        BigDecimal totalSalariesPaid = payrollRepository.sumNetPaidBetween(from, to)
                .add(advanceRepository.sumApprovedAdvancesBetween(from, to));

        // Employee Commissions Debt = Total Earned - Already Paid
        BigDecimal outstandingCommissions = employeeCommissions.subtract(totalSalariesPaid);

        // For netProfit in arbitrary ranges, we currently use paid bills as an approximation 
        // unless overridden in monthly/yearly reports where we can sum by the month string
        BigDecimal netProfit = ownerRevenue.subtract(totalExpenses).subtract(totalBillsPaid);
        BigDecimal realizedProfit = cashReceived
                .subtract(totalSalariesPaid)
                .subtract(totalExpenses)
                .subtract(totalBillsPaid);

        return PeriodReportResponse.builder()
                .period(period)
                .totalTransactions(saleRepository.countByCreatedAtBetween(from, to))
                .totalSales(totalSales)
                .cashReceived(cashReceived)
                .creditSales(creditSales)
                .employeeCommissions(outstandingCommissions)
                .totalSalariesPaid(totalSalariesPaid)
                .totalExpenses(totalExpenses)
                .totalBills(totalBillsPaid)
                .ownerRevenue(ownerRevenue)
                .netProfit(netProfit)
                .realizedProfit(realizedProfit)
                .build();
    }
}
