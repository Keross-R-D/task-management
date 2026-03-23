package com.ikon.projectmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EmployeeDto {
    private String empId;
    private UUID accountId;
    private String name;
    private String email;
    private String organizationEmail;
    private String role;
    private String grade;
    private Boolean active;
}
