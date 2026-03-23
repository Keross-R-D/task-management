package com.ikon.projectmanagement.dto.response;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductOfProjectResponseDto {

    private UUID productIdentifier;

    private UUID projectIdentifier;
    private String projectName;
    private UUID projectManager;

    private UUID accountId;
    private UUID leadIdentifier;

    private String productStatus;
    private String projectStatus;
    private String productType;
    private String productDescription;
    private Double discountPercent;

    private String createdOn;
    private UUID createdBy;
    private UUID updatedBy;
    private String updatedOn;
}
