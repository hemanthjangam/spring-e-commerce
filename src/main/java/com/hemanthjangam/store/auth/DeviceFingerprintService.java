package com.hemanthjangam.store.auth;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DeviceFingerprintService {
    private final HashingService hashingService;

    public String createFingerprint(HttpServletRequest request) {
        var userAgent = safeValue(request.getHeader("User-Agent"));
        var language = safeValue(request.getHeader("Accept-Language"));
        var network = normalizeNetworkAddress(resolveClientIp(request));
        return hashingService.sha256(userAgent + "|" + language + "|" + network);
    }

    public boolean matches(HttpServletRequest request, String fingerprint) {
        return createFingerprint(request).equals(fingerprint);
    }

    private String resolveClientIp(HttpServletRequest request) {
        var forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return safeValue(request.getRemoteAddr());
    }

    private String normalizeNetworkAddress(String address) {
        if (address.contains(".")) {
            var parts = address.split("\\.");
            if (parts.length >= 3) {
                return parts[0] + "." + parts[1] + "." + parts[2];
            }
            return address;
        }

        if (address.contains(":")) {
            var parts = address.split(":");
            var builder = new StringBuilder();
            for (int index = 0; index < Math.min(parts.length, 4); index++) {
                if (index > 0) {
                    builder.append(':');
                }
                builder.append(parts[index]);
            }
            return builder.toString();
        }

        return address;
    }

    private String safeValue(String value) {
        return value == null ? "" : value.trim();
    }
}
