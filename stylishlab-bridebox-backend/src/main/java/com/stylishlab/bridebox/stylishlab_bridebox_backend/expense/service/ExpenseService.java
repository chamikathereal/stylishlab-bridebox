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

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .categoryName(e.getCategory().getCategoryName())
                .categoryType(e.getCategory().getCategoryType())
                .payeeName(e.getPayee() != null ? e.getPayee().getName() : null)
                .amount(e.getAmount())
                .note(e.getNote())
                .recordedByUsername(e.getRecordedBy().getUsername())
                .paidBy(e.getPaidBy())
                .expenseDate(e.getExpenseDate())
                .createdAt(e.getCreatedAt())
                .build();
    }
}
