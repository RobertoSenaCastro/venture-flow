package br.com.venture.ventureflow.inventory.exception;

public class ProductNotFoundException extends RuntimeException{

	private static final long serialVersionUID = 1L;

	public ProductNotFoundException(Long id){
		super("Product not found with ID: " + id);
	}
}
