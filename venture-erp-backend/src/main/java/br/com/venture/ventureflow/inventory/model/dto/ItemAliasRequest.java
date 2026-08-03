package br.com.venture.ventureflow.inventory.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ItemAliasRequest(

        @NotBlank(message = "Alias code is required")
        @Size(max = 50, message = "Alias code must have at most 50 characters")
        String code,

        @NotBlank(message = "Alias source is required")
        @Size(max = 100, message = "Alias source must have at most 100 characters")
        String source
) {
}
