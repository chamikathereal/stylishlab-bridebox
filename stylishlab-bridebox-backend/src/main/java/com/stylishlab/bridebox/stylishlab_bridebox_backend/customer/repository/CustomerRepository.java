package com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByCustomerNameContainingIgnoreCase(String name);
}
