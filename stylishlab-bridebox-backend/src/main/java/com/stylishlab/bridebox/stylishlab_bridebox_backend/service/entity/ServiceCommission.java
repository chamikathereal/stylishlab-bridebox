package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.CommissionType;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_commissions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "service_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private SalonService service;

    @Enumerated(EnumType.STRING)
    @Column(name = "commission_type", nullable = false, length = 20)
    private CommissionType commissionType;

    // Used when commissionType = PERCENTAGE
    @Column(name = "employee_percent", precision = 5, scale = 2)
    private BigDecimal employeePercent;

    @Column(name = "owner_percent", precision = 5, scale = 2)
    private BigDecimal ownerPercent;

    // Used when commissionType = FIXED_AMOUNT
    @Column(name = "employee_fixed_amount", precision = 10, scale = 2)
    private BigDecimal employeeFixedAmount;

    @Column(name = "owner_fixed_amount", precision = 10, scale = 2)
    private BigDecimal ownerFixedAmount;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
