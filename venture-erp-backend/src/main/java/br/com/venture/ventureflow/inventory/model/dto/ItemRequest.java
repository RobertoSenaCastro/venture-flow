package br.com.venture.ventureflow.inventory.model.dto;

import br.com.venture.ventureflow.inventory.model.entity.MeasurementUnit;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.Set;

/**
 * Shared create/update contract.
 *
 * <p>Quantity is deliberately absent: the balance changes through
 * PATCH /api/items/{id}/quantity, never through a catalog edit.
 */
public record ItemRequest(

        @NotBlank(message = "Code is required")
        @Size(max = 50, message = "Code must have at most 50 characters")
        String code,

        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name must have at most 150 characters")
        String name,

        @Size(max = 500, message = "Description must have at most 500 characters")
        String description,

        @NotNull(message = "Unit is required")
        MeasurementUnit unit,

        @NotEmpty(message = "At least one category is required")
        Set<@NotNull @Positive(message = "Category id must be positive") Long> categoryIds,

        @Valid
        List<ItemAliasRequest> aliases
) {
}
