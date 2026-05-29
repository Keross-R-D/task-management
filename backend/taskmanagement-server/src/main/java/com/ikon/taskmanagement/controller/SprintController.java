package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.SprintApi;
import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateSprintStatusDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;
import com.ikon.taskmanagement.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SprintController implements SprintApi {

    private final SprintService sprintService;

    @Override
    public ResponseEntity<SprintResponseDto> createSprint(@RequestHeader("Authorization") String accessToken, SprintRequestDto dto) {
        return ResponseEntity.ok(sprintService.createSprint(dto));
    }

    @Override
    public ResponseEntity<List<SprintResponseDto>> getSprintsByEpicId(@RequestHeader("Authorization") String accessToken, UUID epicId) {
        return ResponseEntity.ok(sprintService.getSprintsByEpicId(epicId));
    }

    @Override
    public ResponseEntity<List<SprintResponseDto>> getSprintsByProjectId(@RequestHeader("Authorization") String accessToken, UUID projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProjectId(projectId));
    }

    @Override
    public ResponseEntity<SprintResponseDto> getSprintById(@RequestHeader("Authorization") String accessToken, UUID id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @Override
    public ResponseEntity<SprintResponseDto> updateSprint(@RequestHeader("Authorization") String accessToken, UUID id, SprintRequestDto dto) {
        return ResponseEntity.ok(sprintService.updateSprint(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteSprint(@RequestHeader("Authorization") String accessToken, UUID id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<SprintResponseDto> patchSprintStatus(@RequestHeader("Authorization") String accessToken, UUID id, UpdateSprintStatusDto dto) {
        return ResponseEntity.ok(sprintService.patchSprintStatus(id, dto));
    }
}
