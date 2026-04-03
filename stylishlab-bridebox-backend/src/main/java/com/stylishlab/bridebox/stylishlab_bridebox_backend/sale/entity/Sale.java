package com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.PaymentStatus;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.entity.Customer;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.SalonService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_no", nullable = false, unique = true, length = 30)
    private String invoiceNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private SalonService service;

    // Snapshot fields — frozen at time of sale
    @Column(name = "service_name_snapshot", nullable = false, length = 100)
    private String serviceNameSnapshot;

    @Column(name = "service_price_snapshot", nullable = false, precision = 10, scale = 2)
    private BigDecimal servicePriceSnapshot;

    @Column(name = "employee_percent_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal employeePercentSnapshot;

    @Column(name = "owner_percent_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal ownerPercentSnapshot;

    // Calculated amounts
    @Column(name = "employee_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal employeeAmount;

    @Column(name = "owner_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal ownerAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "due_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal dueAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
