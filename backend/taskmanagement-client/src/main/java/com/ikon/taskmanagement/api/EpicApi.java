package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Epic APIs", description = "APIs for managing Epics")
@RequestMapping("/api/epics")
public interface EpicApi {

    @Operation(summary = "Create a new epic")
    @PostMapping
    ResponseEntity<EpicResponseDto> createEpic(@RequestBody EpicRequestDto dto);

    @Operation(summary = "Fetch all epics by project ID")
    @GetMapping("/project/{projectId}")
    ResponseEntity<List<EpicResponseDto>> getEpicsByProjectId(@PathVariable("projectId") UUID projectId);

    @Operation(summary = "Fetch epic by ID")
    @GetMapping("/{id}")
    ResponseEntity<EpicResponseDto> getEpicById(@PathVariable("id") UUID id);

    @Operation(summary = "Update an existing epic")
    @PutMapping("/{id}")
    ResponseEntity<EpicResponseDto> updateEpic(@PathVariable("id") UUID id, @RequestBody EpicRequestDto dto);

    @Operation(summary = "Delete epic by ID")
    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteEpic(@PathVariable("id") UUID id);
}
