package br.com.venture.ventureflow.inventory.dto;

import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
