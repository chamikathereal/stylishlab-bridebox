package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.CommissionType;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.BadRequestException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.entity.Customer;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.repository.CustomerRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.EmployeeCommission;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeCommissionRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.repository.EmployeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.repository.SaleRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.service.PayrollService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.SalonService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.ServiceCommission;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository.SalonServiceRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository.ServiceCommissionRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final SalonServiceRepository salonServiceRepository;
    private final EmployeeCommissionRepository commissionRepository;
    private final ServiceCommissionRepository serviceCommissionRepository;
    private final UserRepository userRepository;
    private final PayrollService payrollService;

    @Override
    @Transactional
    public SaleResponse createSale(CreateSaleRequest request, String username) {
        // Fetch related entities
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));

        SalonService service = salonServiceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", request.getServiceId()));

        User createdBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // PRIORITY: Service-specific commission > Default employee commission
        BigDecimal servicePrice = service.getPrice();
        BigDecimal employeePercent;
        BigDecimal ownerPercent;
        BigDecimal employeeAmount;
        BigDecimal ownerAmount;

        Optional<ServiceCommission> serviceCommission = serviceCommissionRepository
                .findByEmployeeIdAndServiceId(employee.getId(), service.getId());

        if (serviceCommission.isPresent()) {
            ServiceCommission sc = serviceCommission.get();
            if (sc.getCommissionType() == CommissionType.FIXED_AMOUNT) {
                // Fixed amount mode — use stored amounts directly
                employeeAmount = sc.getEmployeeFixedAmount();
                ownerAmount = sc.getOwnerFixedAmount();
                // Store equivalent percentages in snapshot for reporting
                employeePercent = employeeAmount.multiply(new BigDecimal("100"))
                        .divide(servicePrice, 2, RoundingMode.HALF_UP);
                ownerPercent = new BigDecimal("100").subtract(employeePercent);
            } else {
                // Percentage mode — calculate from service price
                employeePercent = sc.getEmployeePercent();
                ownerPercent = sc.getOwnerPercent();
                employeeAmount = servicePrice.multiply(employeePercent)
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                ownerAmount = servicePrice.subtract(employeeAmount);
            }
        } else {
            // Fallback to default employee commission
            EmployeeCommission commission = commissionRepository.findCurrentCommission(employee.getId())
                    .orElseThrow(() -> new BadRequestException("No active commission found for employee: " + employee.getFullName()));
            employeePercent = commission.getEmployeePercent();
            ownerPercent = commission.getOwnerPercent();
            employeeAmount = servicePrice.multiply(employeePercent)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            ownerAmount = servicePrice.subtract(employeeAmount);
        }

        // Handle payment
        BigDecimal paidAmount;
        BigDecimal dueAmount;
        PaymentStatus status = request.getPaymentStatus();

        switch (status) {
            case FULLY_PAID:
                paidAmount = servicePrice;
                dueAmount = BigDecimal.ZERO;
                break;
            case CREDIT:
                paidAmount = BigDecimal.ZERO;
                dueAmount = servicePrice;
                break;
            case PARTIAL:
                paidAmount = request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO;
                dueAmount = servicePrice.subtract(paidAmount);
                if (dueAmount.compareTo(BigDecimal.ZERO) < 0) {
                    throw new BadRequestException("Paid amount cannot exceed service price");
                }
                break;
            default:
                throw new BadRequestException("Invalid payment status");
        }

        // Generate invoice number
        String invoiceNo = generateInvoiceNo();

        Sale sale = Sale.builder()
                .invoiceNo(invoiceNo)
                .customer(customer)
                .employee(employee)
                .service(service)
                .serviceNameSnapshot(service.getServiceName())
                .servicePriceSnapshot(servicePrice)
                .employeePercentSnapshot(employeePercent)
                .ownerPercentSnapshot(ownerPercent)
                .employeeAmount(employeeAmount)
                .ownerAmount(ownerAmount)
                .paymentStatus(status)
                .paidAmount(paidAmount)
                .dueAmount(dueAmount)
                .createdBy(createdBy)
                .build();

        sale = saleRepository.save(sale);

        // Hook: Update employee's live salary tracker
        payrollService.addCommissionToTracker(employee.getId(), employeeAmount);

        return toResponse(sale);
    }

    @Override
    public SaleResponse getById(Long id) {
        return toResponse(saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", "id", id)));
    }

    @Override
    public Page<SaleResponse> getAll(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return saleRepository.findAllWithSearch(search, pageable).map(this::toResponse);
        }
        return saleRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public List<SaleResponse> getByEmployee(Long employeeId) {
        return saleRepository.findByEmployeeId(employeeId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<SaleResponse> getByCustomer(Long customerId) {
        return saleRepository.findByCustomerId(customerId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public Page<SaleResponse> getByDateRange(LocalDate from, LocalDate to, String search, Pageable pageable) {
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(LocalTime.MAX);
        if (search != null && !search.trim().isEmpty()) {
            return saleRepository.findByCreatedAtBetweenWithSearch(search, fromDt, toDt, pageable)
                    .map(this::toResponse);
        }
        return saleRepository.findByCreatedAtBetween(fromDt, toDt, pageable)
                .map(this::toResponse);
    }

    private String generateInvoiceNo() {
        String prefix = "INV-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        long count = saleRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private SaleResponse toResponse(Sale s) {
        return SaleResponse.builder()
                .id(s.getId())
                .invoiceNo(s.getInvoiceNo())
                .customerId(s.getCustomer().getId())
                .customerName(s.getCustomer().getCustomerName())
                .employeeId(s.getEmployee().getId())
                .employeeName(s.getEmployee().getFullName())
                .serviceId(s.getService().getId())
                .serviceNameSnapshot(s.getServiceNameSnapshot())
                .servicePriceSnapshot(s.getServicePriceSnapshot())
                .employeePercentSnapshot(s.getEmployeePercentSnapshot())
                .ownerPercentSnapshot(s.getOwnerPercentSnapshot())
                .employeeAmount(s.getEmployeeAmount())
                .ownerAmount(s.getOwnerAmount())
                .paymentStatus(s.getPaymentStatus().name())
                .paidAmount(s.getPaidAmount())
                .dueAmount(s.getDueAmount())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
