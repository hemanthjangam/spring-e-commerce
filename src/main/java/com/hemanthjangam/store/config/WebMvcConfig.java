package com.hemanthjangam.store.config;

import com.hemanthjangam.store.common.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map the public path /images/** to the physical upload directory
        registry.addResourceHandler(FileStorageService.BASE_URL_PATH + "**")
                .addResourceLocations("file:" + uploadDir + File.separator);
    }
}
