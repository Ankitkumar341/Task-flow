package com.taskflow.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @Value("${app.firebase.config-path:}")
    private String configPath;

    @Value("${app.firebase.project-id:}")
    private String projectId;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options;
                if (configPath != null && !configPath.isEmpty()) {
                    FileInputStream serviceAccount = new FileInputStream(configPath);
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .setProjectId(projectId)
                            .build();
                } else {
                    // Fallback to default credentials (e.g. for environment variables or GKE/GCP)
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .setProjectId(projectId)
                            .build();
                }
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialized successfully");
            }
        } catch (IOException e) {
            System.err.println("Error initializing Firebase: " + e.getMessage());
        }
    }
}
