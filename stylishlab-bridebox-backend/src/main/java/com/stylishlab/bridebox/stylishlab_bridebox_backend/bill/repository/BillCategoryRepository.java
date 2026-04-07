package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity.BillCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillCategoryRepository extends JpaRepository<BillCategory, Long> {
    List<BillCategory> findByIsActiveTrue();
}
