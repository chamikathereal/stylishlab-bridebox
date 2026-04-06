package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.exception.ResourceNotFoundException;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity.Expense;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.entity.ExpenseCategory;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository.ExpenseCategoryRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.repository.ExpenseRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.entity.Payee;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.payee.repository.PayeeRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.entity.User;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final PayeeRepository payeeRepository;
    private final UserRepository userRepository;

    public ExpenseResponse recordExpense(CreateExpenseRequest request, String username) {
        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseCategory", "id", request.getCategoryId()));

        User recordedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Payee payee = null;
        if (request.getPayeeId() != null) {
            payee = payeeRepository.findById(request.getPayeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payee", "id", request.getPayeeId()));
        }

        Expense expense = Expense.builder()
                .category(category)
                .payee(payee)
                .amount(request.getAmount())
                .note(request.getNote())
                .recordedBy(recordedBy)
                .paidBy(request.getPaidBy())
                .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
                .build();

        return toResponse(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getAll() {
        return expenseRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ExpenseResponse> getByDateRange(LocalDate from, LocalDate to) {
        return expenseRepository.findByExpenseDateBetween(from, to).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<ExpenseCategoryResponse> getCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> ExpenseCategoryResponse.builder()
                        .id(c.getId()).categoryName(c.getCategoryName())
                        .categoryType(c.getCategoryType()).build())
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return expenseRepository.findByRecordedByOrderByExpenseDateDesc(user).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public ExpenseResponse updateExpense(Long id, UpdateExpenseRequest request, String username) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Security check: Only Admin OR the employee who recorded it (Same-Day only) can edit
        boolean isAdmin = user.getRole() == com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.Role.ADMIN;
        boolean isOwner = expense.getRecordedBy().getUsername().equals(username);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to edit this expense");
        }

        if (!isAdmin && !expense.getExpenseDate().equals(LocalDate.now())) {
            throw new RuntimeException("Employees can only edit expenses recorded today");
        }

        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ExpenseCategory", "id", request.getCategoryId()));

        Payee payee = null;
        if (request.getPayeeId() != null) {
            payee = payeeRepository.findById(request.getPayeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payee", "id", request.getPayeeId()));
        }

        // Audit: Stash current amount as lastPrice if it's changing
        if (request.getAmount() != null && !request.getAmount().equals(expense.getAmount())) {
            expense.setLastAmount(expense.getAmount());
        }

        expense.setCategory(category);
        expense.setPayee(payee);
        expense.setAmount(request.getAmount());
        expense.setNote(request.getNote());
        expense.setPaidBy(request.getPaidBy());
        expense.setLastEditReason(request.getEditReason());
        expense.setLastEditNote(request.getEditNote());

        return toResponse(expenseRepository.save(expense));
    }

    public void deleteExpense(Long id, String username) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "id", id));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        boolean isAdmin = user.getRole() == com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums.Role.ADMIN;
        boolean isOwner = expense.getRecordedBy().getUsername().equals(username);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to delete this expense");
        }

        if (!isAdmin && !expense.getExpenseDate().equals(LocalDate.now())) {
            throw new RuntimeException("Employees can only delete expenses recorded today");
        }

        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .categoryId(e.getCategory().getId())
                .payeeId(e.getPayee() != null ? e.getPayee().getId() : null)
                .categoryName(e.getCategory().getCategoryName())
                .categoryType(e.getCategory().getCategoryType())
                .payeeName(e.getPayee() != null ? e.getPayee().getName() : null)
                .amount(e.getAmount())
                .lastAmount(e.getLastAmount())
                .note(e.getNote())
                .recordedByUsername(e.getRecordedBy().getUsername())
                .paidBy(e.getPaidBy())
                .expenseDate(e.getExpenseDate())
                .lastEditReason(e.getLastEditReason())
                .lastEditNote(e.getLastEditNote())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
