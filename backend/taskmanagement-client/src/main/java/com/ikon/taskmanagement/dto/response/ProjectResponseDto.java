package com.ikon.projectmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponseDto {

    private UUID projectIdentifier;

    private UUID projectManager;
    private String projectName;
    private String projectStatus;
    private String projectNumber;
    private String parentProjectNo;
    private String contractNumber;
    private String projectClient;
    private String projectCity;
    private String projectCountry;
    private String currency;
    private String projectImage;
    private String contractUpload;
    private String source;
    private String productType;
    private String expenses;
    private String formattedActualRevenueIncludingVAT_deal;
    private Boolean isCompleted;
    private Boolean groupNotExist;
    private Boolean isDebtRevenue_deal;
    private String projectDescription;

    private UUID createdById;
    private UUID updatedBy;
    private UUID projectManagerDelegates;

    private LocalDate projectStartDate;
    private LocalDate contractedStartDate;
    private LocalDate contractedEndDate;
    private LocalDate createdOn;
    private LocalDate updatedOn;

    private List<UUID> projectTeam;
    private List<UUID> projectTeamUnderProjectManager;
    private List<UUID> projectTeamUnderProjectManagerDelegates;

    private String groupAssigneesEditStr;
    private String groupAssigneesViewStr;

    private Map<String, Object> participants;
    private Map<String, Object> contractedProductIdentifierWiseDataObj;

    // Product link
    private UUID productIdentifier;
}
