package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.EpicApi;
import com.ikon.taskmanagement.dto.request.EpicRequestDto;
import com.ikon.taskmanagement.dto.response.EpicResponseDto;
import com.ikon.taskmanagement.service.EpicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class EpicController implements EpicApi {

    private final EpicService epicService;

    @Override
    public ResponseEntity<EpicResponseDto> createEpic(@RequestHeader("Authorization") String accessToken, EpicRequestDto dto) {
        return ResponseEntity.ok(epicService.createEpic(dto));
    }

    @Override
    public ResponseEntity<List<EpicResponseDto>> getEpicsByProjectId(@RequestHeader("Authorization") String accessToken, UUID projectId) {
        return ResponseEntity.ok(epicService.getEpicsByProjectId(projectId));
    }

    @Override
    public ResponseEntity<EpicResponseDto> getEpicById(@RequestHeader("Authorization") String accessToken, UUID id) {
        return ResponseEntity.ok(epicService.getEpicById(id));
    }

    @Override
    public ResponseEntity<EpicResponseDto> updateEpic(@RequestHeader("Authorization") String accessToken, UUID id, EpicRequestDto dto) {
        return ResponseEntity.ok(epicService.updateEpic(id, dto));
    }

    @Override
    public ResponseEntity<Void> deleteEpic(@RequestHeader("Authorization") String accessToken, UUID id) {
        epicService.deleteEpic(id);
        return ResponseEntity.noContent().build();
    }
}
