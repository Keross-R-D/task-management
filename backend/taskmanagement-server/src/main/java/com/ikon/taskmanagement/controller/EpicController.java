package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.EpicApi;
import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import com.ikon.taskmanagement.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class EpicController implements EpicApi {

    private final EpicService epicService;

    @Override
    public ResponseEntity<EpicResponseDto> createEpic(EpicRequestDto dto) {
        return ResponseEntity.ok(epicService.createEpic(dto));
    }

    @Override
    public ResponseEntity<List<EpicResponseDto>> getEpicsByProjectId(UUID projectId) {
        return ResponseEntity.ok(epicService.getEpicsByProjectId(projectId));
    }

    @Override
    public ResponseEntity<EpicResponseDto> getEpicById(UUID id) {
        return ResponseEntity.ok(epicService.getEpicById(id));
    }

    @Override
    public ResponseEntity<EpicResponseDto> updateEpic(UUID id, EpicRequestDto dto) {
        return ResponseEntity.ok(epicService.updateEpic(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteEpic(UUID id) {
        epicService.deleteEpic(id);
        return ResponseEntity.noContent().build();
    }
}
