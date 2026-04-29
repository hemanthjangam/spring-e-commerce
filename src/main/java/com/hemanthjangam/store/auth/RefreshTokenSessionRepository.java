package com.hemanthjangam.store.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenSessionRepository extends JpaRepository<RefreshTokenSession, Long> {
    Optional<RefreshTokenSession> findByTokenId(UUID tokenId);

    void deleteByExpiresAtBefore(Instant cutoff);
}
