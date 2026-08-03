package br.com.venture.ventureflow.inventory.dto;

import java.math.BigDecimal;

import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/**
 * Input contract for creating a product.
 *
 * <p>Validation annotations define the intended API boundary constraints,
 * although the current product controller does not expose an endpoint that
 * consumes this record.</p>
 *
 * @param code required unique product code
 * @param name required product name
 * @param description optional product description
 * @param quantity initial nonnegative quantity with up to three persisted decimal places
 * @param unit unit used to interpret the quantity
 */
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
