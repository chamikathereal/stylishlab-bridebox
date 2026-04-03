package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
}
