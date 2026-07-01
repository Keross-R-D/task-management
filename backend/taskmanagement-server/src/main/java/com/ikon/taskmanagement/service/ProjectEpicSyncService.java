package com.ikon.taskmanagement.service;
import org.springframework.http.ResponseEntity;
import java.util.Map;

public interface ProjectEpicSyncService {
    ResponseEntity<Map<String, String>> triggerProjectEpicSync();
}