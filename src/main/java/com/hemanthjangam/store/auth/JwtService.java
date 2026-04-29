package com.hemanthjangam.store.auth;

import com.hemanthjangam.store.users.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

@AllArgsConstructor
@Service
public class JwtService {
    private final JwtConfig jwtConfig;

    public Jwt generateAccessToken(User user, String fingerprint) {
        return generateToken(user, jwtConfig.getAccessTokenExpiration(), "access", fingerprint);
    }

    public Jwt generateRefreshToken(User user, String fingerprint) {
        return generateToken(user, jwtConfig.getRefreshTokenExpiration(), "refresh", fingerprint);
    }

    private Jwt generateToken(User user, long tokenExpiration, String type, String fingerprint) {
        var claims = Jwts.claims()
                .subject(user.getId().toString())
                .id(UUID.randomUUID().toString())
                .add("email", user.getEmail())
                .add("name", user.getName())
                .add("role", user.getRole())
                .add("type", type)
                .add("fp", fingerprint)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * tokenExpiration))
                .build();

        return new Jwt(claims, jwtConfig.getSecretKey());
    }

    public Jwt parseToken(String token) {
        try {
            var claims = getClaims(token);
            return new Jwt(claims, jwtConfig.getSecretKey());
        } catch (JwtException e) {
            return null;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(jwtConfig.getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
