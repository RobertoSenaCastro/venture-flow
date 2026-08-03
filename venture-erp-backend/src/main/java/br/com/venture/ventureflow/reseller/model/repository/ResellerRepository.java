package br.com.venture.ventureflow.reseller.model.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;

/**
 * Spring Data persistence boundary for reseller registration and selection.
 */
public interface ResellerRepository extends JpaRepository<Reseller, Long> {
	
	/**
	 * Checks document uniqueness after the service has normalized the value.
	 *
	 * @param documentNumber digit-only CPF or CNPJ
	 * @return whether the document is already persisted
	 */
	boolean existsByDocumentNumber(String documentNumber);
	
	/**
	 * Resolves a reseller that may be assigned to a sales order.
	 *
	 * @param id reseller identifier
	 * @return the reseller only when it exists and is active
	 */
	Optional<Reseller> findByIdAndActiveTrue(Long id);
	
	/**
	 * Lists selectable resellers alphabetically.
	 *
	 * @return active resellers ordered by name ascending
	 */
	List<Reseller> findByActiveTrueOrderByNameAsc();
}
