package br.com.venture.ventureflow.user.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Sole path to a stored credential. */
public record PasswordChangeRequest(

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 100, message = "Password must have between 8 and 100 characters")
        String password
) {
}
