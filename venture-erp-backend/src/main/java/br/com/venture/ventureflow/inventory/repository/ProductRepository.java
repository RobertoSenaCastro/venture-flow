package br.com.venture.ventureflow.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.venture.ventureflow.inventory.entity.Product;

/**
 * Spring Data persistence boundary for the partial product/inventory model.
 *
 * <p>Only inherited CRUD operations are currently declared.</p>
 */
public interface ProductRepository extends JpaRepository<Product, Long>{

}
