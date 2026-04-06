package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.entity.Payee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payee_id")
    private Payee payee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "last_amount", precision = 10, scale = 2)
    private BigDecimal lastAmount;

    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    @Column(name = "paid_by", nullable = false, length = 50)
    private String paidBy;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "last_edit_reason", length = 100)
    private String lastEditReason;

    @Column(name = "last_edit_note", columnDefinition = "TEXT")
    private String lastEditNote;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
