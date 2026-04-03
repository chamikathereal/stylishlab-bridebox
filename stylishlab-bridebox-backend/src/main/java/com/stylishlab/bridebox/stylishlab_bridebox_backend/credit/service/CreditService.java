package com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.service;

import com.stylishlab.bridebox.stylishlab_bridebox_backend.credit.dto.*;
import java.util.List;

public interface CreditService {
    CreditPaymentResponse recordPayment(Long saleId, RecordCreditPaymentRequest request, String username);
    List<CustomerCreditSummaryResponse> getPendingCredits();
    List<CreditPaymentResponse> getCreditHistoryForSale(Long saleId);
    List<CreditPaymentResponse> getCreditHistoryForCustomer(Long customerId);
}
