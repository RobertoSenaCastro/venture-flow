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

@Service
public class ResellerService {

    private final ResellerRepository resellerRepository;

    public ResellerService(
            ResellerRepository resellerRepository
    ) {
        this.resellerRepository = resellerRepository;
    }

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

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "The reseller name is required."
            );
        }

        return name.trim();
    }

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

        return documentNumber.replaceAll("\\D", "");
    }

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
    
    public List<ResellerOptionResponse> findAllActive() {
        return resellerRepository
            .findByActiveTrueOrderByNameAsc()
            .stream()
            .map(ResellerOptionResponse::from)
            .toList();
    }
    
}
