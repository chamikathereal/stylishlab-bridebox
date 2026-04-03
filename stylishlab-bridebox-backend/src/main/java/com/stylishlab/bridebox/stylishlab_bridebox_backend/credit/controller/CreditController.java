package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.controller;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.common.dto.ApiResponse;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.dto.*;
import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.service.CreditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@Tag(name = "Credit Management", description = "Manage customer credit payments and settlements")
public class CreditController {

    private final CreditService creditService;

    @PostMapping("/sales/{saleId}/payments")
    @Operation(summary = "Record credit payment", description = "Record a payment against a credit or partially paid sale")
    public ResponseEntity<ApiResponse<CreditPaymentResponse>> recordPayment(
            @PathVariable Long saleId,
            @Valid @RequestBody RecordCreditPaymentRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Payment recorded",
                creditService.recordPayment(saleId, request, auth.getName())));
    }

    @GetMapping("/pending")
    @Operation(summary = "Get customers with pending credits")
    public ResponseEntity<ApiResponse<List<CustomerCreditSummaryResponse>>> getPending() {
        return ResponseEntity.ok(ApiResponse.ok(creditService.getPendingCredits()));
    }

    @GetMapping("/sales/{saleId}/history")
    @Operation(summary = "Get credit payment history for a sale")
    public ResponseEntity<ApiResponse<List<CreditPaymentResponse>>> getSaleHistory(@PathVariable Long saleId) {
        return ResponseEntity.ok(ApiResponse.ok(creditService.getCreditHistoryForSale(saleId)));
    }

    @GetMapping("/customers/{customerId}/history")
    @Operation(summary = "Get credit payment history for a customer")
    public ResponseEntity<ApiResponse<List<CreditPaymentResponse>>> getCustomerHistory(@PathVariable Long customerId) {
        return ResponseEntity.ok(ApiResponse.ok(creditService.getCreditHistoryForCustomer(customerId)));
    }
}
