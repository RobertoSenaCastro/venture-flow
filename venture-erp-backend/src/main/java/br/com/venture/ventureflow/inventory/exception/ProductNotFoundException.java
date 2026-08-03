package br.com.venture.ventureflow.inventory.exception;

/**
 * Signals that a product identifier did not resolve in the repository.
 *
 * <p>The global exception handler does not currently map this exception to a
 * specific HTTP response.</p>
 */
public class ProductNotFoundException extends RuntimeException{

	private static final long serialVersionUID = 1L;

	/**
	 * Creates an exception whose message identifies the missing product.
	 *
	 * @param id identifier that could not be found
	 */
	public ProductNotFoundException(Long id){
		super("Product not found with ID: " + id);
	}
}
