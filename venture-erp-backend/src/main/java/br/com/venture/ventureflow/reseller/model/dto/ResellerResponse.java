package br.com.venture.ventureflow.reseller.model.dto;

import java.time.LocalDateTime;

import br.com.venture.ventureflow.reseller.model.entity.DocumentType;
import br.com.venture.ventureflow.reseller.model.entity.Reseller;

/**
 * Full API representation returned after reseller registration.
 *
 * @param id persisted reseller identifier
 * @param name normalized reseller name
 * @param documentType persisted document classification
 * @param documentNumber digit-only document number
 * @param active whether the reseller can be selected for new or updated orders
 * @param createdAt creation timestamp assigned by the service
 */
public record ResellerResponse(Long id,
        String name,
        DocumentType documentType,
        String documentNumber,
        boolean active,
        LocalDateTime createdAt
) {
	/**
	 * Converts the persistence entity into the public response contract.
	 *
	 * @param reseller entity to represent
	 * @return response containing persisted reseller values
	 */
	public static ResellerResponse from(Reseller reseller) {
        return new ResellerResponse(
                reseller.getId(),
                reseller.getName(),
                reseller.getDocumentType(),
                reseller.getDocumentNumber(),
                reseller.isActive(),
                reseller.getCreatedAt()
            );
	}
}
