package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.SprintApi;
import com.ikon.taskmanagement.dto.request.SprintRequestDto;
import com.ikon.taskmanagement.dto.request.UpdateSprintStatusDto;
import com.ikon.taskmanagement.dto.response.SprintResponseDto;
import com.ikon.taskmanagement.service.SprintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SprintController implements SprintApi {

    private final SprintService sprintService;

    @Override
    public ResponseEntity<SprintResponseDto> createSprint(SprintRequestDto dto) {
        return ResponseEntity.ok(sprintService.createSprint(dto));
    }

    @Override
    public ResponseEntity<List<SprintResponseDto>> getSprintsByEpicId(UUID epicId) {
        return ResponseEntity.ok(sprintService.getSprintsByEpicId(epicId));
    }

    @Override
    public ResponseEntity<List<SprintResponseDto>> getSprintsByProjectId(UUID projectId) {
        return ResponseEntity.ok(sprintService.getSprintsByProjectId(projectId));
    }

    @Override
    public ResponseEntity<SprintResponseDto> getSprintById(UUID id) {
        return ResponseEntity.ok(sprintService.getSprintById(id));
    }

    @Override
    public ResponseEntity<SprintResponseDto> updateSprint(UUID id, SprintRequestDto dto) {
        return ResponseEntity.ok(sprintService.updateSprint(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteSprint(UUID id) {
        sprintService.deleteSprint(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<SprintResponseDto> patchSprintStatus(UUID id, UpdateSprintStatusDto dto) {
        return ResponseEntity.ok(sprintService.patchSprintStatus(id, dto));
    }
}
