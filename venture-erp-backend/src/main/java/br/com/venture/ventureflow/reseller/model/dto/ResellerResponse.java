package br.com.venture.ventureflow.reseller.model.dto;

import java.time.LocalDateTime;

import br.com.venture.ventureflow.reseller.model.entity.DocumentType;
import br.com.venture.ventureflow.reseller.model.entity.Reseller;

public record ResellerResponse(Long id,
        String name,
        DocumentType documentType,
        String documentNumber,
        boolean active,
        LocalDateTime createdAt
) {
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
