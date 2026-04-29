package com.hemanthjangam.store.auth;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RevokedTokenService {
    private final RevokedTokenRepository revokedTokenRepository;

    @Transactional(readOnly = true)
    public boolean isRevoked(UUID tokenId) {
        return revokedTokenRepository.existsByTokenId(tokenId);
    }

    @Transactional
    public void revoke(UUID tokenId, Date expiresAt, String reason) {
        if (revokedTokenRepository.existsByTokenId(tokenId)) {
            return;
        }

        revokedTokenRepository.save(RevokedToken.builder()
                .tokenId(tokenId)
                .expiresAt(expiresAt.toInstant())
                .revokedAt(Instant.now())
                .reason(reason)
                .build());
    }

    @Transactional
    public void cleanupExpired() {
        revokedTokenRepository.deleteByExpiresAtBefore(Instant.now());
    }
}
