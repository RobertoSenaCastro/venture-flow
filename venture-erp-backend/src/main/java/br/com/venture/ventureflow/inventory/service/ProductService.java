package br.com.venture.ventureflow.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.venture.ventureflow.inventory.dto.ProductRequest;
import br.com.venture.ventureflow.inventory.dto.ProductResponse;
import br.com.venture.ventureflow.inventory.dto.ProductUpdateRequest;
import br.com.venture.ventureflow.inventory.entity.Product;
import br.com.venture.ventureflow.inventory.exception.ProductNotFoundException;
import br.com.venture.ventureflow.inventory.repository.ProductRepository;

/**
 * Provides transactional CRUD-style operations for the current product model.
 *
 * <p>The service stores a single quantity on each product; it does not model
 * stock movements, reservations, or sales-order relationships. These methods
 * are not currently exposed by the empty product controller.</p>
 */
@Service
public class ProductService {

	private final ProductRepository productRepository;
	
	public ProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}
	
	/**
	 * Creates an active product from the supplied values.
	 *
	 * @param request product fields including the initial quantity
	 * @return persisted product response
	 */
	@Transactional
	public ProductResponse create(ProductRequest request) {
		Product product = new Product(
				request.code(), 
				request.name() , 
				request.description(), 
				request.quantity(), 
				request.unit()
		);
		
		Product savedProduct = productRepository.save(product);
		return ProductResponse.from(savedProduct);
	}
	
	/**
	 * Lists all products, including inactive rows.
	 *
	 * @return every persisted product in repository order
	 */
	@Transactional(readOnly = true)
	public List<ProductResponse> findAll(){
		return productRepository.findAll().stream().map(ProductResponse::from).toList();
				
	}
	
	/**
	 * Retrieves a product regardless of active state.
	 *
	 * @param id persisted product identifier
	 * @return matching product response
	 * @throws ProductNotFoundException if the identifier does not exist
	 */
	@Transactional(readOnly = true)
	public ProductResponse findById(Long id) {
		Product product = findEntityById(id);
		
		return ProductResponse.from(product);
		
		
	}
	
	/**
	 * Updates code, name, description, and unit while preserving quantity and
	 * active state.
	 *
	 * @param id persisted product identifier
	 * @param request replacement descriptive values
	 * @return updated product response
	 * @throws ProductNotFoundException if the identifier does not exist
	 */
	@Transactional
	public ProductResponse update(Long id, ProductUpdateRequest request) {
	    Product product = findEntityById(id);

	    product.setCode(request.code());
	    product.setName(request.name());
	    product.setDescription(request.description());
	    product.setUnit(request.unit());

	    Product savedProduct = productRepository.save(product);
	    return ProductResponse.from(savedProduct);
	}
	
	/**
	 * Marks a product inactive without physically deleting it.
	 *
	 * @param id persisted product identifier
	 * @return updated product response
	 * @throws ProductNotFoundException if the identifier does not exist
	 */
	@Transactional
	public ProductResponse deactivate(Long id) {
	    Product product = findEntityById(id);
	    product.deactivate();

	    Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);
	}

	/**
	 * Marks a product active and returns the entity directly.
	 *
	 * <p>This return type differs from the service's other public operations and
	 * is retained as part of the current behavior.</p>
	 *
	 * @param id persisted product identifier
	 * @return saved active product entity
	 * @throws ProductNotFoundException if the identifier does not exist
	 */
	@Transactional
	public Product activate(Long id) {
	    Product product = findEntityById(id);
	    product.activate();

	    return productRepository.save(product);
	}
	
	private Product findEntityById(Long id) {
		return productRepository.findById(id).
				orElseThrow(() -> new ProductNotFoundException(id));
	}
}
