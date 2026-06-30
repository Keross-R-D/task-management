package com.ikon.taskmanagement.api;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Tag(name = "Project Sync APIs", description = "APIs for syncing projects with external system")
@RequestMapping("/api/sync")
public interface ProjectEpicSyncApi {

    @Operation(summary = "Trigger a manual sync for projects")
    @PostMapping("/project-epic")
    ResponseEntity<Map<String, String>> triggerProjectEpicSync();
}
