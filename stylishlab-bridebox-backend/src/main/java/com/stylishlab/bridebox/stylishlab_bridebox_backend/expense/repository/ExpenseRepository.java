package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetween(LocalDate from, LocalDate to);
    List<Expense> findByCategoryId(Long categoryId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :from AND :to")
    BigDecimal sumExpensesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
