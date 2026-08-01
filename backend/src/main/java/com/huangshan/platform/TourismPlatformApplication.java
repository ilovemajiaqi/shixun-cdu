package com.huangshan.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TourismPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(TourismPlatformApplication.class, args);
    }

}
