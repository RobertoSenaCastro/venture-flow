package br.com.venture.ventureflow.auth.dto;

import br.com.venture.ventureflow.user.model.entity.UserRole;

/**
 * What the frontend needs after a successful login.
 *
 * <p>The role travels here so the UI can build navigation without a second
 * call. It is a display hint only: every authorization decision is taken again
 * on the server, because a client can send whatever it likes.
 */
public record LoginResponse(
        String token,
        long expiresInSeconds,
        Long userId,
        String name,
        String email,
        UserRole role,
        Long resellerId
) {
}
