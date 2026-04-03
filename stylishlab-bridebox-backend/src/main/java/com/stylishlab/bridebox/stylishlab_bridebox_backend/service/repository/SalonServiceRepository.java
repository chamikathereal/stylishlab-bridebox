package com.stylishlab.bridebox.stylishlab_bridebox_backend.service.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.service.entity.SalonService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalonServiceRepository extends JpaRepository<SalonService, Long> {
    List<SalonService> findByIsActiveTrue();
}
