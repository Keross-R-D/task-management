package com.ikon.taskmanagement.service.impl;

import com.ikon.connector.dto.response.ConnectionResponse;
import com.ikon.connector.dto.response.ConnectorConfigResponse;
import com.ikon.connector.exception.ConnectorException;
import com.ikon.connector.service.ConnectionService;
import com.ikon.connector.service.ConnectorConfigService;
import com.ikon.connector.service.SyncTaskExecutor;
import com.ikon.taskmanagement.service.ProjectEpicSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectEpicSyncServiceImpl implements ProjectEpicSyncService {

    private static final String PROJECT_MODULE = "Project";
    private static final String EPIC_MODULE = "Epic";

    private final SyncTaskExecutor syncTaskExecutor;
    private final ConnectionService connectionService;
    private final ConnectorConfigService configService;

    @Override
    public ResponseEntity<Map<String, String>> triggerProjectEpicSync() {
        try {
            // 1. Run Project sync FULLY (blocks until complete)
            SyncResult projectResult = syncByModule(PROJECT_MODULE);
            if (!projectResult.success) {
                return ResponseEntity.status(projectResult.status)
                        .body(Map.of("error", projectResult.message));
            }

            // 2. Epic sync starts only after Project's blocking call above has returned
            SyncResult epicResult = syncByModule(EPIC_MODULE);
            if (!epicResult.success) {
                return ResponseEntity.status(epicResult.status)
                        .body(Map.of(
                                "status", "PARTIAL",
                                "message", projectResult.message,
                                "error", epicResult.message));
            }

            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Project sync and Epic sync both completed successfully."));

        } catch (Exception e) {
            log.error("Failed to trigger manual sync for project and epic: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start sync process: " + e.getMessage()));
        }
    }

    private SyncResult syncByModule(String moduleName) {
        Optional<ConnectorConfigResponse> config = configService.getAllConnectorConfigs().stream()
                .filter(c -> moduleName.equals(c.getAvailableModule()))
                .max(Comparator.comparing(ConnectorConfigResponse::getCreatedAt));

        if (config.isEmpty()) {
            return new SyncResult(false, HttpStatus.NOT_FOUND,
                    moduleName + " connector configuration not found.");
        }

        Optional<ConnectionResponse> connection = connectionService.getConnections().stream()
                .filter(conn -> conn.getConnectorConfig() != null &&
                        config.get().getId().equals(conn.getConnectorConfig().getId()))
                .max(Comparator.comparing(ConnectionResponse::getCreatedAt));

        if (connection.isEmpty()) {
            return new SyncResult(false, HttpStatus.NOT_FOUND,
                    moduleName + " connection not found.");
        }

        UUID connectionId = connection.get().getId();

        try {
            // BLOCKS on this thread until the sync fully finishes (success or failure)
            long recordsLoaded = syncTaskExecutor.executeSyncBlocking(connectionId);
            log.info("{} sync completed: {} records loaded.", moduleName, recordsLoaded);
        } catch (ConnectorException ce) {
            return new SyncResult(false, ce.getStatus(),
                    moduleName + " sync failed: " + ce.getMessage());
        }

        return new SyncResult(true, HttpStatus.OK, moduleName + " sync completed successfully.");
    }

    private static class SyncResult {
        private final boolean success;
        private final HttpStatus status;
        private final String message;

        private SyncResult(boolean success, HttpStatus status, String message) {
            this.success = success;
            this.status = status;
            this.message = message;
        }
    }
}