package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.entity;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.entity.Customer;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.sale.entity.Sale;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "paid_at")
    @CreationTimestamp
    private LocalDateTime paidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private User recordedBy;

    private String note;
}
