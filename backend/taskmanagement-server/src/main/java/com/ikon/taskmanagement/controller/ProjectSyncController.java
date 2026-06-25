package com.ikon.taskmanagement.controller;

import com.ikon.connector.dto.response.ConnectionResponse;
import com.ikon.connector.dto.response.ConnectorConfigResponse;
import com.ikon.connector.service.ConnectionService;
import com.ikon.connector.service.ConnectorConfigService;
import com.ikon.connector.service.SyncTaskExecutor;
import com.ikon.taskmanagement.api.ProjectSyncApi;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.util.Comparator;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ProjectSyncController implements ProjectSyncApi {

    private final SyncTaskExecutor syncTaskExecutor;
    private final ConnectionService connectionService;
    private final ConnectorConfigService configService;

    @Override
    public ResponseEntity<Map<String, String>> triggerProjectSync() {
        try {
            // 1. Find the LATEST configuration for the Project module
            Optional<ConnectorConfigResponse> projectConfig = configService.getAllConnectorConfigs().stream()
                    .filter(c -> "Project".equals(c.getAvailableModule()))
                    .max(Comparator.comparing(ConnectorConfigResponse::getCreatedAt)); // <-- Updated here

            if (projectConfig.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project connector configuration not found."));
            }

            // 2. Find the LATEST active connection tied to that configuration
            Optional<ConnectionResponse> projectConnection = connectionService.getConnections().stream()
                    .filter(conn -> conn.getConnectorConfig() != null &&
                            projectConfig.get().getId().equals(conn.getConnectorConfig().getId())) // <-- Updated
                                                                                                   // mapping here
                    .max(Comparator.comparing(ConnectionResponse::getCreatedAt)); // <-- Updated here

            if (projectConnection.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Project connection not found."));
            }

            // 3. Trigger the sync asynchronously
            syncTaskExecutor.executeSync(projectConnection.get().getId());

            return ResponseEntity.accepted().body(Map.of(
                    "status", "ACCEPTED",
                    "message", "Project sync triggered successfully. Running in the background."));

        } catch (Exception e) {
            log.error("Failed to trigger manual sync for projects: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start sync process: " + e.getMessage()));
        }
    }
}
