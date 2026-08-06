package br.com.venture.ventureflow.user.model.dto;

import br.com.venture.ventureflow.user.model.entity.User;
import br.com.venture.ventureflow.user.model.entity.UserRole;

import java.time.LocalDateTime;

/**
 * Administrative view of a user.
 *
 * <p>The password hash has no field here and must never gain one.
 */
public record UserResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        Long resellerId,
        String resellerName,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getReseller() == null ? null : user.getReseller().getId(),
                user.getReseller() == null ? null : user.getReseller().getName(),
                user.isActive(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
