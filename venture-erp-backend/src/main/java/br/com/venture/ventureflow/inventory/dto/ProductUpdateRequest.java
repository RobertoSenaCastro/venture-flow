package br.com.venture.ventureflow.inventory.dto;

import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Input contract for updating product descriptive fields.
 *
 * <p>Quantity is intentionally absent from this contract, so the current
 * update service preserves the existing quantity. No HTTP endpoint currently
 * consumes this record.</p>
 *
 * @param code required product code
 * @param name required product name
 * @param description optional product description
 * @param unit unit used to interpret the existing quantity
 */
public record ProductUpdateRequest(
		
	@NotBlank
    @Size(max = 50)
    String code,

    @NotBlank
    @Size(max = 150)
    String name,

    @Size(max = 500)
    String description,

    @NotNull
    UnitOfMeasure unit


		
) {
}
