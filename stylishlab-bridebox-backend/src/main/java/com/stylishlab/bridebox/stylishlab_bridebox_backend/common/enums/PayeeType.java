package com.stylishlab.bridebox.stylishlab_bridebox_backend.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PayeeType {
    SUPPLIER("Supplier"),
    BANK("Bank"),
    OTHER("Other Management");

    private final String displayName;
}
