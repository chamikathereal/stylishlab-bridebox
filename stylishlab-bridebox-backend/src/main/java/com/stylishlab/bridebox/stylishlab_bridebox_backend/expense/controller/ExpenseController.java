package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.service.ExpenseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getAll(search, pageable)));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get expense categories")
    public ResponseEntity<ApiResponse<List<ExpenseCategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getCategories()));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's expenses")
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getMyExpenses(Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getExpensesByUser(auth.getName())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update expense", description = "Employees can only update same-day expenses they recorded")
    public ResponseEntity<ApiResponse<ExpenseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExpenseRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Expense updated", expenseService.updateExpense(id, request, auth.getName())));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete expense", description = "Employees can only delete same-day expenses they recorded")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, Authentication auth) {
        expenseService.deleteExpense(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted", null));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get expenses by date range")
    public ResponseEntity<ApiResponse<Page<ExpenseResponse>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(expenseService.getByDateRange(from, to, search, pageable)));
    }
}
