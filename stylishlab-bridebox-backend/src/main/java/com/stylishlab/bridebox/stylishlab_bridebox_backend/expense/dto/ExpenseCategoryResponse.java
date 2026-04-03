package com.stylishlab.bridebox.stylishlab_bridebox_backend.expense.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExpenseCategoryResponse {
    private Long id;
    private String categoryName;
    private String categoryType;
}
