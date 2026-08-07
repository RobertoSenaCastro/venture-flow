package br.com.venture.ventureflow.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/**
 * Issues and verifies signed access tokens.
 *
 * <p>Tokens are stateless: nothing is stored server side, so a token stays
 * valid until it expires. Signing out therefore only discards the client copy.
 * Revoking a token before expiry would require a deny list, which is why the
 * lifetime is kept short rather than convenient.
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long lifetimeSeconds;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.lifetime-seconds}") long lifetimeSeconds
    ) {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be at least 32 characters for HS256.");
        }

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.lifetimeSeconds = lifetimeSeconds;
    }

    /**
     * @param email subject of the token, matching the stored user email
     * @return a signed compact token
     */
    public String issue(String email) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(lifetimeSeconds)))
                .signWith(signingKey)
                .compact();
    }

    /**
     * Verifies the signature and expiry, returning the subject when both hold.
     *
     * <p>Returns empty rather than throwing, because a bad token is an
     * anonymous request, not a server error.
     */
    public Optional<String> readSubject(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return Optional.ofNullable(claims.getSubject());
        } catch (JwtException | IllegalArgumentException exception) {
            return Optional.empty();
        }
    }

    public long getLifetimeSeconds() {
        return lifetimeSeconds;
    }
}
