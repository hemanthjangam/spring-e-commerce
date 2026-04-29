CREATE TABLE refresh_token_sessions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token_id CHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    fingerprint_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    revoke_reason VARCHAR(64) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_token_sessions_token_id (token_id),
    CONSTRAINT fk_refresh_token_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_token_sessions_expires_at
    ON refresh_token_sessions (expires_at);

CREATE TABLE revoked_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token_id CHAR(36) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NOT NULL,
    reason VARCHAR(64) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_revoked_tokens_token_id (token_id)
);

CREATE INDEX idx_revoked_tokens_expires_at
    ON revoked_tokens (expires_at);
