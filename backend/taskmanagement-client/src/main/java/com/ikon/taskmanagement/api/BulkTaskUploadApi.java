package com.ikon.taskmanagement.api;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Tag(name = "Bulk Task Upload APIs", description = "Bulk create epics, sprints and tasks via JSON list")
@RequestMapping("/api/tasks")
public interface BulkTaskUploadApi {

    @Operation(
        summary = "Bulk upload tasks",
        description = """
            Accepts a list of rows (parsed from CSV by frontend via PapaParse).
            For each row:
              - Epic: find by name+projectId → create if not found
              - Sprint: find by name+epicId  → create if not found
              - Task: find by title+sprintId → create if not found (skip if duplicate)
            Entire operation is atomic — all or nothing.
        """
    )
    @PostMapping("/bulk-upload")
    ResponseEntity<BulkTaskUploadResponseDto> bulkUpload(@RequestHeader("Authorization") String accessToken, 
            @RequestBody List<BulkTaskUploadRequestDto> rows);
}