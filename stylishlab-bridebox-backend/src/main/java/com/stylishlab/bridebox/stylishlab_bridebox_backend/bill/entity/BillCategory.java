package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bill_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
