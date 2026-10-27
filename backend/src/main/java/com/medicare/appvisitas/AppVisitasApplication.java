package com.medicare.appvisitas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class AppVisitasApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppVisitasApplication.class, args);
    }
}
