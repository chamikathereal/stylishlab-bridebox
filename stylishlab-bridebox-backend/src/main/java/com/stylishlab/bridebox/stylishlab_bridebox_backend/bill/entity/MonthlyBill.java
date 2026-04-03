package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.BillStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "monthly_bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_type", nullable = false, length = 50)
    private String billType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "bill_month", nullable = false, length = 7)
    private String billMonth;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status;

    private String note;
}
