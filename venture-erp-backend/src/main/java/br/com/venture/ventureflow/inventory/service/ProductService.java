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

@Service
public class ProductService {

	private final ProductRepository productRepository;
	
	public ProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}
	
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
	
	@Transactional(readOnly = true)
	public List<ProductResponse> findAll(){
		return productRepository.findAll().stream().map(ProductResponse::from).toList();
				
	}
	
	@Transactional(readOnly = true)
	public ProductResponse findById(Long id) {
		Product product = findEntityById(id);
		
		return ProductResponse.from(product);
		
		
	}
	
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
	
	@Transactional
	public ProductResponse deactivate(Long id) {
	    Product product = findEntityById(id);
	    product.deactivate();

	    Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);
	}

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
