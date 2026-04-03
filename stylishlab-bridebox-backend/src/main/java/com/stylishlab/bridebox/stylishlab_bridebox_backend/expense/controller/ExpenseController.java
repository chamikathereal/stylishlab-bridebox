package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Tag(name = "Expense Management", description = "Record and manage business expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    @Operation(summary = "Record expense", description = "Both employees and admin can record expenses")
    public ResponseEntity<ApiResponse<ExpenseResponse>> record(@Valid @RequestBody CreateExpenseRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Expense recorded", expenseService.recordExpense(request, auth.getName())));
    }

    @GetMapping
    @Operation(summary = "Get all expenses")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getAll()));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get expense categories")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getCategories()));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get expenses by date range")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getByDateRange(from, to)));
    }
}
