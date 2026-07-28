package br.com.venture.ventureflow.reseller.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;

public interface ResellerRepository extends JpaRepository<Reseller, Long> {
	
	boolean existsByDocumentNumber(String documentNumber);
	
	Optional<Reseller> findByIdAndActiveTrue(Long id);
	
	List<Reseller> findByActiveTrueOrderByNameAsc();
}
