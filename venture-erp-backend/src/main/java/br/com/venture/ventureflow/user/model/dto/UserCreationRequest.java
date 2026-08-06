package br.com.venture.ventureflow.user.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Creation adds the initial password to the shared contract.
 *
 * <p>Kept separate from {@link UserRequest} so the update path has no field
 * capable of touching credentials.
 */
public record UserCreationRequest(

        @NotNull(message = "User data is required")
        @Valid
        UserRequest user,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must have between 8 and 100 characters")
        String password
) {
}
