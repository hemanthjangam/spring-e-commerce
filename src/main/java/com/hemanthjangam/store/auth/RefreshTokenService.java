package com.hemanthjangam.store.auth;

import com.hemanthjangam.store.users.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenSessionRepository refreshTokenSessionRepository;
    private final HashingService hashingService;

    @Transactional
    public void createSession(User user, Jwt refreshToken, String fingerprint) {
        cleanupExpired();

        refreshTokenSessionRepository.save(RefreshTokenSession.builder()
                .tokenId(refreshToken.getTokenId())
                .user(user)
                .tokenHash(hashingService.sha256(refreshToken.toString()))
                .fingerprintHash(hashingService.sha256(fingerprint))
                .expiresAt(refreshToken.getExpiration().toInstant())
                .createdAt(Instant.now())
                .build());
    }

    @Transactional(readOnly = true)
    public boolean isSessionValid(Jwt refreshToken, String rawToken, String fingerprint) {
        var session = refreshTokenSessionRepository.findByTokenId(refreshToken.getTokenId());
        if (session.isEmpty()) {
            return false;
        }

        var storedSession = session.get();
        return storedSession.getRevokedAt() == null
                && storedSession.getExpiresAt().isAfter(Instant.now())
                && storedSession.getTokenHash().equals(hashingService.sha256(rawToken))
                && storedSession.getFingerprintHash().equals(hashingService.sha256(fingerprint));
    }

    @Transactional
    public void revoke(UUID tokenId, String reason) {
        refreshTokenSessionRepository.findByTokenId(tokenId).ifPresent(session -> {
            if (session.getRevokedAt() == null) {
                session.setRevokedAt(Instant.now());
                session.setRevokeReason(reason);
            }
        });
    }

    @Transactional
    public void cleanupExpired() {
        refreshTokenSessionRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
