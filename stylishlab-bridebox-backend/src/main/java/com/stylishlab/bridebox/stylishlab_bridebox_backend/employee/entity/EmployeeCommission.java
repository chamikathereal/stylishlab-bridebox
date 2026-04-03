package com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_commissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeCommission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "employee_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal employeePercent;

    @Column(name = "owner_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal ownerPercent;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
