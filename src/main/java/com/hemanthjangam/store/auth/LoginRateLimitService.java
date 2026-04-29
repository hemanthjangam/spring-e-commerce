package com.hemanthjangam.store.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimitService {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);

    private final Map<String, AttemptWindow> attempts = new ConcurrentHashMap<>();

    public void assertAllowed(HttpServletRequest request) {
        var key = key(request);
        var window = attempts.get(key);
        if (window == null) {
            return;
        }

        if (window.isExpired()) {
            attempts.remove(key);
            return;
        }

        if (window.failures >= MAX_ATTEMPTS) {
            throw new TooManyRequestsException("Too many login attempts. Try again later.");
        }
    }

    public void recordFailure(HttpServletRequest request) {
        attempts.compute(key(request), (key, current) -> {
            if (current == null || current.isExpired()) {
                return new AttemptWindow(1, Instant.now().plus(WINDOW));
            }
            current.failures++;
            return current;
        });
    }

    public void recordSuccess(HttpServletRequest request) {
        attempts.remove(key(request));
    }

    private String key(HttpServletRequest request) {
        var forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class AttemptWindow {
        private int failures;
        private final Instant blockedUntil;

        private AttemptWindow(int failures, Instant blockedUntil) {
            this.failures = failures;
            this.blockedUntil = blockedUntil;
        }

        private boolean isExpired() {
            return blockedUntil.isBefore(Instant.now());
        }
    }
}
