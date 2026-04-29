package com.hemanthjangam.store.auth;

import com.hemanthjangam.store.users.UserDto;
import com.hemanthjangam.store.users.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final JwtConfig jwtConfig;
    private final RefreshTokenService refreshTokenService;
    private final DeviceFingerprintService deviceFingerprintService;
    private final LoginRateLimitService loginRateLimitService;
    private final RevokedTokenService revokedTokenService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        loginRateLimitService.assertAllowed(httpRequest);
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    ));
        } catch (BadCredentialsException exception) {
            loginRateLimitService.recordFailure(httpRequest);
            throw exception;
        }

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var fingerprint = deviceFingerprintService.createFingerprint(httpRequest);
        var accessToken = jwtService.generateAccessToken(user, fingerprint);
        var refreshToken = jwtService.generateRefreshToken(user, fingerprint);

        refreshTokenService.createSession(user, refreshToken, fingerprint);
        loginRateLimitService.recordSuccess(httpRequest);
        addRefreshCookie(response, refreshToken.toString(), jwtConfig.getRefreshTokenExpiration(), httpRequest.isSecure());

        return ResponseEntity.ok(new JwtResponse(accessToken.toString()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<JwtResponse> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var jwt = jwtService.parseToken(refreshToken);
        var fingerprint = deviceFingerprintService.createFingerprint(request);
        if (jwt == null
                || jwt.isExpired()
                || !"refresh".equals(jwt.getType())
                || !deviceFingerprintService.matches(request, jwt.getFingerprint())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!refreshTokenService.isSessionValid(jwt, refreshToken, fingerprint)) {
            refreshTokenService.revoke(jwt.getTokenId(), "refresh-validation-failed");
            clearRefreshCookie(response, request.isSecure());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        var user = userRepository.findById(jwt.getUserId()).orElseThrow();
        refreshTokenService.revoke(jwt.getTokenId(), "rotated");

        var accessToken = jwtService.generateAccessToken(user, fingerprint);
        var rotatedRefreshToken = jwtService.generateRefreshToken(user, fingerprint);
        refreshTokenService.createSession(user, rotatedRefreshToken, fingerprint);
        addRefreshCookie(response, rotatedRefreshToken.toString(), jwtConfig.getRefreshTokenExpiration(), request.isSecure());

        return ResponseEntity.ok(new JwtResponse(accessToken.toString()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {
        if (refreshToken != null) {
            var jwt = jwtService.parseToken(refreshToken);
            if (jwt != null) {
                refreshTokenService.revoke(jwt.getTokenId(), "logout");
            }
        }

        var authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            var accessJwt = jwtService.parseToken(authHeader.replace("Bearer ", ""));
            if (accessJwt != null && "access".equals(accessJwt.getType())) {
                revokedTokenService.revoke(accessJwt.getTokenId(), accessJwt.getExpiration(), "logout");
            }
        }

        clearRefreshCookie(response, request.isSecure());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> csrf(CsrfToken csrfToken) {
        return ResponseEntity.ok(Map.of("token", csrfToken.getToken()));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        var currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(new UserDto(currentUser.getId(), currentUser.getName(), currentUser.getEmail()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Void> handleBadCredentialsException() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    private void addRefreshCookie(HttpServletResponse response, String token, int maxAgeSeconds, boolean secure) {
        var cookie = ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(maxAgeSeconds)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response, boolean secure) {
        var cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
