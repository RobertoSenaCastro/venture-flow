package br.com.venture.ventureflow.reseller.model.service;

import br.com.venture.ventureflow.reseller.model.dto.ResellerRequest;
import br.com.venture.ventureflow.reseller.model.dto.ResellerResponse;
import br.com.venture.ventureflow.reseller.model.entity.DocumentType;
import br.com.venture.ventureflow.reseller.model.entity.Reseller;
import br.com.venture.ventureflow.reseller.model.repository.ResellerRepository;
import br.com.venture.ventureflow.reseller.model.dto.ResellerOptionResponse;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Applies reseller registration rules and provides active reseller options.
 *
 * <p>Names are trimmed, CPF/CNPJ values are stored with digits only, and
 * duplicate normalized documents are rejected before persistence.</p>
 */
@Service
public class ResellerService {

    private final ResellerRepository resellerRepository;

    public ResellerService(
            ResellerRepository resellerRepository
    ) {
        this.resellerRepository = resellerRepository;
    }

    /**
     * Registers an active reseller after normalizing and validating its input.
     *
     * @param request reseller data supplied by the API
     * @return the persisted reseller represented as an API response
     * @throws IllegalArgumentException if required data is missing, the
     * document length is invalid, or the document is already registered
     */
    public ResellerResponse create(
            ResellerRequest request
    ) {
        String normalizedName =
                normalizeName(request.name());

        String normalizedDocument =
                normalizeDocument(request.documentNumber());

        validateDocument(
                request.documentType(),
                normalizedDocument
        );

        if (
                resellerRepository.existsByDocumentNumber(
                        normalizedDocument
                )
        ) {
            throw new IllegalArgumentException(
                    "A reseller with this document is already registered."
            );
        }

        Reseller reseller = new Reseller(
                normalizedName,
                request.documentType(),
                normalizedDocument,
                LocalDateTime.now()
        );

        Reseller savedReseller =
                resellerRepository.save(reseller);

        return ResellerResponse.from(savedReseller);
    }

    /**
     * Requires a nonblank name and removes surrounding whitespace.
     *
     * @param name raw name from the request
     * @return trimmed name
     * @throws IllegalArgumentException if the value is null or blank
     */
    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "The reseller name is required."
            );
        }

        return name.trim();
    }

    /**
     * Converts a formatted CPF or CNPJ to the representation stored in the
     * database.
     *
     * @param documentNumber raw document text
     * @return document containing digits only
     * @throws IllegalArgumentException if the value is null or blank
     */
    private String normalizeDocument(
            String documentNumber
    ) {
        if (
                documentNumber == null ||
                documentNumber.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "The document number is required."
            );
        }

        // Formatting punctuation is intentionally discarded before validation
        // and uniqueness checks so formatted and unformatted values match.
        return documentNumber.replaceAll("\\D", "");
    }

    /**
     * Validates the normalized digit count for the selected document type.
     *
     * <p>This method does not calculate CPF or CNPJ check digits.</p>
     *
     * @param documentType CPF or CNPJ classification
     * @param documentNumber normalized digit-only value
     * @throws IllegalArgumentException if the type is absent or the digit count
     * does not match the selected type
     */
    private void validateDocument(
            DocumentType documentType,
            String documentNumber
    ) {
        if (documentType == null) {
            throw new IllegalArgumentException(
                    "The document type is required."
            );
        }

        int expectedLength = switch (documentType) {
            case CPF -> 11;
            case CNPJ -> 14;
        };

        if (documentNumber.length() != expectedLength) {
            throw new IllegalArgumentException(
                    documentType
                            + " must contain "
                            + expectedLength
                            + " digits."
            );
        }
        
    }
    
    /**
     * Returns the resellers currently eligible for sales-order association,
     * ordered alphabetically and mapped to compact option DTOs.
     *
     * @return active reseller options
     */
    public List<ResellerOptionResponse> findAllActive() {
        return resellerRepository
            .findByActiveTrueOrderByNameAsc()
            .stream()
            .map(ResellerOptionResponse::from)
            .toList();
    }
    
}
