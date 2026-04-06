package com.stylishlab.bridebox.stylishlab_bridebox_backend.payroll.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_tracker")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Builder.Default
    @Column(name = "current_salary", nullable = false, precision = 10, scale = 2)
    private BigDecimal currentSalary = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_advances", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAdvances = BigDecimal.ZERO;

    @Column(name = "last_settlement_date")
    private LocalDateTime lastSettlementDate;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
