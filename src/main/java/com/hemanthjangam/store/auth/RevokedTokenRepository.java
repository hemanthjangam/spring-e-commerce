package com.hemanthjangam.store.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {
    boolean existsByTokenId(UUID tokenId);

    void deleteByExpiresAtBefore(Instant cutoff);
}
