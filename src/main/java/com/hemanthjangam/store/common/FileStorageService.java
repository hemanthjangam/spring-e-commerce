package com.hemanthjangam.store.common;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    // Defines the base URL where the images can be served (e.g., http://localhost:8080/images)
    public static final String BASE_URL_PATH = "/images/";

    // Directory where the files will be physically saved on the server
    @Value("${file.upload-dir}") // Set this property in application.properties/yaml
    private String uploadDir;

    /**
     * Saves the uploaded file to the local file system.
     * @param file The file uploaded via MultipartRequest.
     * @return The public URL path (e.g., /images/uuid-filename.jpg).
     */
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot store empty file.");
        }

        // Ensure the upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }

        try {
            // Normalize filename and prepend a UUID to ensure uniqueness
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;

            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // Return the public URL path that the frontend will use to display the image
            return BASE_URL_PATH + fileName;

        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file.", ex);
        }
    }
}