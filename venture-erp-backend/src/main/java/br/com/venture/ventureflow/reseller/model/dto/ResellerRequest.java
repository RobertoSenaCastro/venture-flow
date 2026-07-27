package br.com.venture.ventureflow.reseller.model.dto;

import br.com.venture.ventureflow.reseller.model.entity.DocumentType;

public record ResellerRequest(String name,
	    DocumentType documentType,
	    String documentNumber
) {
}
