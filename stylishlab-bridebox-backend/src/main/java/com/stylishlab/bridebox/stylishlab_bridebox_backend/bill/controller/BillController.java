package com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.bill.service.BillService;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Monthly Bills", description = "Manage rent, electricity, water, and other monthly bills")
public class BillController {

    private final BillService billService;

    @PostMapping
    @Operation(summary = "Create monthly bill", operationId = "createBill")
    public ResponseEntity<ApiResponse<BillResponse>> create(@Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Bill created", billService.create(request)));
    }

    @GetMapping
    @Operation(summary = "Get all bills with pagination", operationId = "getAllBills")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<BillResponse>>> getAll(
            @org.springdoc.core.annotations.ParameterObject org.springframework.data.domain.Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getAllPaginated(search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bill by ID", operationId = "getBillById")
    public ResponseEntity<ApiResponse<BillResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getById(id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update bill", operationId = "updateBill")
    public ResponseEntity<ApiResponse<BillResponse>> update(@PathVariable Long id, @Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Bill updated", billService.update(id, request)));
    }

    @PatchMapping("/{id}/settle")
    @Operation(summary = "Mark bill as paid", operationId = "settleBill")
    public ResponseEntity<ApiResponse<BillResponse>> settle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Bill settled", billService.settle(id)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bill", operationId = "deleteBill")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        billService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Bill deleted", null));
    }

    @GetMapping("/month/{yearMonth}")
    @Operation(summary = "Get bills by month", operationId = "getBillsByMonth", description = "Format: YYYY-MM")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getByMonth(@PathVariable String yearMonth) {
        return ResponseEntity.ok(ApiResponse.ok(billService.getByMonth(yearMonth)));
    }
}
