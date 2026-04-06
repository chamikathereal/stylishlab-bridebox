package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "total_earnings", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalEarnings;

    @Column(name = "total_advances", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAdvances;

    @Column(name = "net_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal netPaid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "settled_by", nullable = false)
    private User settledBy;

    @CreationTimestamp
    @Column(name = "settled_at", updatable = false)
    private LocalDateTime settledAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
