
package com.ikon.taskmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.cassandra.CassandraHealthContributorAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import com.ikon.autoconfigure.annotation.EnableIkonSdk;
import com.ikon.sdk.config.IkonSdkConfig;

@EntityScan(basePackages = {
        "com.ikon.taskmanagement.entity",

})
@EnableJpaRepositories(basePackages = {
        "com.ikon.taskmanagement.repository",

})
@EnableFeignClients(basePackages = {
        "com.ikon.client",

})
@SpringBootApplication(scanBasePackages = {
        "com.ikon.taskmanagement",

}, exclude = {
        CassandraAutoConfiguration.class,
        CassandraHealthContributorAutoConfiguration.class
})
@EnableJpaAuditing
@EnableIkonSdk(configuration = IkonSdkConfig.class)
public class TaskmanagementApplication {

    public static void main(String[] args) {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(TaskmanagementApplication.class, args);
    }
}
