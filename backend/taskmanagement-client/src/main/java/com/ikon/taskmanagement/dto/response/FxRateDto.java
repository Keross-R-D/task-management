package com.ikon.projectmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FxRateDto {
    private UUID id;
    private UUID accountId;
    private String fromCurrency;
    private String toCurrency;
    private BigDecimal rate;
    private String effectiveDate;
}
