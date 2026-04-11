package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity.Expense;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseDateBetween(LocalDate from, LocalDate to);
    List<Expense> findByCategoryId(Long categoryId);
    List<Expense> findByRecordedByOrderByExpenseDateDesc(User recordedBy);

    @Query("SELECT e FROM Expense e WHERE " +
           "(:search IS NULL OR LOWER(e.note) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.paidBy) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.recordedBy.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.category.categoryName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.payee.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Expense> findAllWithSearch(@Param("search") String search, Pageable pageable);

    @Query("SELECT e FROM Expense e WHERE " +
           "(e.expenseDate BETWEEN :from AND :to) AND " +
           "(:search IS NULL OR LOWER(e.note) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.paidBy) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.recordedBy.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.category.categoryName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.payee.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Expense> findByDateRangeWithSearch(@Param("from") LocalDate from, 
                                            @Param("to") LocalDate to, 
                                            @Param("search") String search, 
                                            Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.expenseDate BETWEEN :from AND :to")
    BigDecimal sumExpensesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e")
    BigDecimal sumAllExpenses();
}
