package br.com.venture.ventureflow.inventory.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.venture.ventureflow.inventory.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}
