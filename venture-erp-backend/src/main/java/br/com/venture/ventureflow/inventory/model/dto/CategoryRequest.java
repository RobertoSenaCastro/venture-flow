package br.com.venture.ventureflow.inventory.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Code is required")
        @Size(max = 30, message = "Code must have at most 30 characters")
        String code,

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must have at most 150 characters")
        String name,

        @Size(max = 500, message = "Description must have at most 500 characters")
        String description
) {
}
