package com.ikon.taskmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.ikon.autoconfigure.annotation.EnableIkonSdk;
import com.ikon.sdk.config.IkonSdkConfig;

@EntityScan(basePackages = { "com.ikon.taskmanagement.entity" })
@EnableJpaRepositories(basePackages = { "com.ikon.taskmanagement.repository" })
@EnableIkonSdk(configuration = IkonSdkConfig.class)
@SpringBootApplication
@ComponentScan(basePackages = {
        "com.ikon.taskmanagement",
        "com.ikon.sdk"
})
public class TaskManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskManagementApplication.class, args);
    }
}