package com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.entity.Payee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayeeRepository extends JpaRepository<Payee, Long> {
    List<Payee> findByIsActiveTrue();
}
