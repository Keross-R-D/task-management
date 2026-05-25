package com.ikon.taskmanagement.service;

import com.ikon.taskmanagement.dto.request.TaskRequest;
import com.ikon.taskmanagement.dto.response.TaskResponse;
import com.ikon.taskmanagement.entity.Task;
import com.ikon.taskmanagement.enums.TaskPriority;
import com.ikon.taskmanagement.enums.TaskStatus;
import com.ikon.taskmanagement.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        Task task = modelMapper.map(request, Task.class);

        // Set default values if not provided
        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.PENDING);
        }
        if (task.getPriority() == null) {
            task.setPriority(TaskPriority.MEDIUM);
        }

        Task savedTask = taskRepository.save(task);
        return modelMapper.map(savedTask, TaskResponse.class);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return modelMapper.map(task, TaskResponse.class);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasksWithFilters(TaskStatus status, TaskPriority priority, String search) {
        return taskRepository.findAllWithFilters(status, priority, search).stream()
                .map(task -> modelMapper.map(task, TaskResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksPaginated(Pageable pageable, TaskStatus status,
            TaskPriority priority, String search) {
        Page<Task> taskPage = taskRepository.findAllWithFiltersPaginated(status, priority, search, pageable);
        return taskPage.map(task -> modelMapper.map(task, TaskResponse.class));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        // Update fields
        existingTask.setTitle(request.getTitle());
        existingTask.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            existingTask.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            existingTask.setPriority(request.getPriority());
        }

        Task updatedTask = taskRepository.save(existingTask);
        return modelMapper.map(updatedTask, TaskResponse.class);
    }

    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }
}
