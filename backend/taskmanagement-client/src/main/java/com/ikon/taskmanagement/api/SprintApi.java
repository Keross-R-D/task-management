package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateSprintStatusDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@Tag(name = "Sprint APIs", description = "APIs for managing Sprints")
@RequestMapping("/api/sprints")
public interface SprintApi {

    @Operation(summary = "Create a new sprint")
    @PostMapping
    ResponseEntity<SprintResponseDto> createSprint(@RequestHeader("Authorization") String accessToken, @RequestBody SprintRequestDto dto);

    @Operation(summary = "Fetch sprints by Epic ID")
    @GetMapping("/epic/{epicId}")
    ResponseEntity<List<SprintResponseDto>> getSprintsByEpicId(@RequestHeader("Authorization") String accessToken, @PathVariable("epicId") UUID epicId);

    @Operation(summary = "Fetch sprints by Project ID")
    @GetMapping("/project/{projectId}")
    ResponseEntity<List<SprintResponseDto>> getSprintsByProjectId(@RequestHeader("Authorization") String accessToken, @PathVariable("projectId") UUID projectId);

    @Operation(summary = "Fetch sprint by ID")
    @GetMapping("/{id}")
    ResponseEntity<SprintResponseDto> getSprintById(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update an existing sprint")
    @PutMapping("/{id}")
    ResponseEntity<SprintResponseDto> updateSprint(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id, @RequestBody SprintRequestDto dto);

    @Operation(summary = "Delete sprint by ID")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteSprint(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id);

    @Operation(summary = "Update sprint status")
    @PatchMapping("/{id}/status")
    ResponseEntity<SprintResponseDto> patchSprintStatus(@RequestHeader("Authorization") String accessToken, @PathVariable("id") UUID id, @RequestBody UpdateSprintStatusDto dto);
}
