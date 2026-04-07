package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.entity.BillCategory;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.repository.BillCategoryRepository;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bill-categories")
@RequiredArgsConstructor
@Tag(name = "Bill Categories", description = "Management of bill types and categories")
public class BillCategoryController {

    private final BillCategoryRepository billCategoryRepository;

    @GetMapping
    @Operation(summary = "Get all active bill categories")
    public ResponseEntity<ApiResponse<List<BillCategory>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok(billCategoryRepository.findByIsActiveTrue()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new bill category (Admin only)")
    public ResponseEntity<ApiResponse<BillCategory>> create(@RequestBody BillCategory category) {
        return ResponseEntity.ok(ApiResponse.ok("Category created", billCategoryRepository.save(category)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate a bill category (Admin only)")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        billCategoryRepository.findById(id).ifPresent(c -> {
            c.setActive(false);
            billCategoryRepository.save(c);
        });
        return ResponseEntity.ok().build();
    }
}
