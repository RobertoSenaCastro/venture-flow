package br.com.venture.ventureflow.inventory.dto;

import java.math.BigDecimal;

import br.com.venture.ventureflow.inventory.entity.Product;
import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;

/**
 * DTO representation of the currently modeled product fields.
 *
 * @param id persisted product identifier
 * @param code unique product code
 * @param name product name
 * @param description optional product description
 * @param quantity currently stored quantity
 * @param unit unit used for the quantity
 * @param active whether the product is active
 */
public record ProductResponse (
		
	Long id,
	String code,
	String name,
	String description,
	BigDecimal quantity,
	UnitOfMeasure unit,
	boolean active
		
){
	
	/**
	 * Converts a product entity to a DTO without exposing the JPA entity.
	 *
	 * @param product entity to represent
	 * @return response containing the current entity values
	 */
	public static ProductResponse from (Product product) {
		
		return new ProductResponse(
			product.getId(), 
			product.getCode(),
			product.getName(),
			product.getDescription(),
			product.getQuantity(),
			product.getUnit(),
			product.isActive()			
		);
	}
}
