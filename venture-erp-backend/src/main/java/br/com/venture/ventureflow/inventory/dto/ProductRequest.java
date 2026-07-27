package br.com.venture.ventureflow.inventory.dto;

import java.math.BigDecimal;

import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record ProductRequest (

	@NotBlank
	@Size(max = 50)
	String code,
	
	@NotBlank
	@Size(max = 150)
	String name,
	
	@Size(max = 500)
	String description,
	
	@NotNull
	@PositiveOrZero
	BigDecimal quantity,
	
	@NotNull
	UnitOfMeasure unit
		
){
}
