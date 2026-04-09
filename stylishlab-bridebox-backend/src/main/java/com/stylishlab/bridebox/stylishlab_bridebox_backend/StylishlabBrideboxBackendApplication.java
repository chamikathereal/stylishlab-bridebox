package com.stylishlab.bridebox.stylishlab_bridebox_backend;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableAsync
public class StylishlabBrideboxBackendApplication {

	@PostConstruct
	public void init() {
		// Set JVM default TimeZone to Asia/Colombo
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Colombo"));
	}

	public static void main(String[] args) {
		SpringApplication.run(StylishlabBrideboxBackendApplication.class, args);
	}

}
