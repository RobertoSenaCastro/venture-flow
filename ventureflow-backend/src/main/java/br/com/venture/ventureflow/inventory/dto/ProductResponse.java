package br.com.venture.ventureflow.inventory.dto;

import java.math.BigDecimal;

import br.com.venture.ventureflow.inventory.entity.Product;
import br.com.venture.ventureflow.inventory.entity.UnitOfMeasure;

public record ProductResponse (
		
	Long id,
	String code,
	String name,
	String description,
	BigDecimal quantity,
	UnitOfMeasure unit,
	boolean active
		
){
	
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
