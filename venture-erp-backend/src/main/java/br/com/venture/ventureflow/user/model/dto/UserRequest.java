package br.com.venture.ventureflow.user.model.dto;

import br.com.venture.ventureflow.user.model.entity.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Shared create/update contract.
 *
 * <p>The password is absent on purpose: it changes only through
 * PATCH /api/users/{id}/password, so a routine profile edit can never
 * overwrite or blank a credential.
 *
 * <p>{@code resellerId} is validated against {@code role} by the service,
 * because the rule is conditional and bean validation cannot express it here.
 */
public record UserRequest(

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must have at most 150 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(max = 180, message = "Email must have at most 180 characters")
        String email,

        @NotNull(message = "Role is required")
        UserRole role,

        @Positive(message = "Reseller id must be positive")
        Long resellerId
) {
}
