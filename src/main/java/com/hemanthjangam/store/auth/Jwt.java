package com.hemanthjangam.store.auth;

import com.hemanthjangam.store.users.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

public class Jwt {
    private final Claims claims;
    private final SecretKey secretKey;

    public Jwt(Claims claims, SecretKey secretKey) {
        this.claims = claims;
        this.secretKey = secretKey;
    }

    public boolean isExpired() {
        return claims.getExpiration().before(new Date());
    }

    public Long getUserId() {
        return Long.valueOf(claims.getSubject());
    }

    public Role getRole() {
        return Role.valueOf(claims.get("role", String.class));
    }

    public String getType() {
        return claims.get("type", String.class);
    }

    public UUID getTokenId() {
        return UUID.fromString(claims.getId());
    }

    public String getFingerprint() {
        return claims.get("fp", String.class);
    }

    public Date getExpiration() {
        return claims.getExpiration();
    }

    public String toString() {
        return Jwts.builder().claims(claims).signWith(secretKey).compact();
    }
}
