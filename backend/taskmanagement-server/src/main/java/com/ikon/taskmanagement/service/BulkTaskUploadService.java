package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.BulkTaskUploadRequestDto;
import com.ikon.taskmanagement.dto.response.BulkTaskUploadResponseDto;

import java.util.List;

public interface BulkTaskUploadService {

    /**
     * Find-or-create Epic → Sprint → Task for each row atomically.
     * If any row fails validation → full rollback, no records saved.
     */
    BulkTaskUploadResponseDto bulkUpload(List<BulkTaskUploadRequestDto> rows);
}