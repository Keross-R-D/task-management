package com.ikon.taskmanagement.controller;

import com.ikon.taskmanagement.api.BulkTaskUploadApi;
import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto;
import com.ikon.taskmanagement.service.BulkTaskUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BulkTaskUploadController implements BulkTaskUploadApi {

    private final BulkTaskUploadService bulkTaskUploadService;

    @Override
    public ResponseEntity<BulkTaskUploadResponseDto> bulkUpload(@RequestHeader("Authorization") String accessToken, List<BulkTaskUploadRequestDto> rows) {

        if (rows == null || rows.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        BulkTaskUploadResponseDto response = bulkTaskUploadService.bulkUpload(rows);

        if (response.getErrors() != null && !response.getErrors().isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}