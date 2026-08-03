package br.com.venture.ventureflow.reseller.model.dto;

import br.com.venture.ventureflow.reseller.model.entity.DocumentType;

/**
 * Input contract for reseller registration.
 *
 * <p>This record has no Bean Validation annotations. The service checks
 * required values, trims the name, removes document punctuation, and validates
 * digit length.</p>
 *
 * @param name reseller name
 * @param documentType whether the document is a CPF or CNPJ
 * @param documentNumber document text, which may contain formatting characters
 */
public record ResellerRequest(String name,
	    DocumentType documentType,
	    String documentNumber
) {
}
