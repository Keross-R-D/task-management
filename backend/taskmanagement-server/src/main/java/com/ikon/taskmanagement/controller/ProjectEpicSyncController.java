package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.service.ProjectEpicSyncService;
import com.ikon.taskmanagement.api.ProjectEpicSyncApi;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ProjectEpicSyncController implements ProjectEpicSyncApi {

    private final ProjectEpicSyncService projectEpicSyncService;

    @Override
    public ResponseEntity<Map<String, String>> triggerProjectEpicSync() {
        return projectEpicSyncService.triggerProjectEpicSync();
    }
}