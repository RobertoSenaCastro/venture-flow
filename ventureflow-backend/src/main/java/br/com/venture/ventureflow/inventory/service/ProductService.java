package br.com.venture.ventureflow.inventory.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.venture.ventureflow.inventory.entity.Product;
import br.com.venture.ventureflow.inventory.exception.ProductNotFoundException;
import br.com.venture.ventureflow.inventory.repository.ProductRepository;

@Service
public class ProductService {

	private final ProductRepository productRepository;
	
	public ProductService(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}
	
	public Product createProduct(Product product) {
		return productRepository.save(product);
	}
	
	public List<Product> findAll(Product product){
		return productRepository.findAll();
				
	}
	
	public Product findById(Long id) {
		return productRepository.findById(id).
				orElseThrow(() -> new ProductNotFoundException(id));
	}
	
	@Transactional
	public Product update(Long id, Product updatedProduct) {
	    Product existingProduct = findById(id);

	    existingProduct.setCode(updatedProduct.getCode());
	    existingProduct.setName(updatedProduct.getName());
	    existingProduct.setDescription(updatedProduct.getDescription());
	    existingProduct.setQuantity(updatedProduct.getQuantity());
	    existingProduct.setUnit(updatedProduct.getUnit());

	    return productRepository.save(existingProduct);
	}
	
	@Transactional
	public Product deactivate(Long id) {
	    Product product = findById(id);
	    product.deactivate();

	    return productRepository.save(product);
	}

	@Transactional
	public Product activate(Long id) {
	    Product product = findById(id);
	    product.activate();

	    return productRepository.save(product);
	}
}
