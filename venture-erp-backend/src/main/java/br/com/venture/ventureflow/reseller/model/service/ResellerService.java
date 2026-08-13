package br.com.venture.ventureflow.reseller.model.service;

import br.com.venture.ventureflow.reseller.exception.DuplicateResellerDocumentException;
import br.com.venture.ventureflow.reseller.exception.InvalidResellerDataException;
import br.com.venture.ventureflow.reseller.exception.ResellerNotFoundException;
import br.com.venture.ventureflow.reseller.model.dto.ResellerOptionResponse;
import br.com.venture.ventureflow.reseller.model.dto.ResellerRequest;
import br.com.venture.ventureflow.reseller.model.dto.ResellerResponse;
import br.com.venture.ventureflow.reseller.model.entity.DocumentType;
import br.com.venture.ventureflow.reseller.model.entity.Reseller;
import br.com.venture.ventureflow.reseller.model.repository.ResellerRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ResellerService {

    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.ASC, "name")
            .and(Sort.by("id"));

    private final ResellerRepository resellerRepository;

    public ResellerService(ResellerRepository resellerRepository) {
        this.resellerRepository = resellerRepository;
    }

    @Transactional
    public ResellerResponse create(ResellerRequest request) {
        ValidatedResellerData data = validateAndNormalize(request);

        if (resellerRepository.existsByDocumentNumber(data.documentNumber())) {
            throw new DuplicateResellerDocumentException(data.documentNumber());
        }

        Reseller reseller = new Reseller(
                data.name(),
                data.documentType(),
                data.documentNumber()
        );

        return ResellerResponse.from(resellerRepository.save(reseller));
    }

    @Transactional
    public ResellerResponse update(Long id, ResellerRequest request) {
        Reseller reseller = load(id);
        ValidatedResellerData data = validateAndNormalize(request);

        if (resellerRepository.existsByDocumentNumberAndIdNot(data.documentNumber(), id)) {
            throw new DuplicateResellerDocumentException(data.documentNumber());
        }

        reseller.setName(data.name());
        reseller.setDocumentType(data.documentType());
        reseller.setDocumentNumber(data.documentNumber());

        return ResellerResponse.from(reseller);
    }

    @Transactional(readOnly = true)
    public List<ResellerOptionResponse> findAllActiveOptions() {
        return resellerRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(ResellerOptionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResellerResponse> findAllActive() {
        return resellerRepository.findAllByActiveTrue(DEFAULT_SORT).stream()
                .map(ResellerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ResellerResponse> findAllInactive() {
        return resellerRepository.findAllByActiveFalse(DEFAULT_SORT).stream()
                .map(ResellerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ResellerResponse findById(Long id) {
        return ResellerResponse.from(load(id));
    }

    @Transactional
    public void deactivate(Long id) {
        load(id).setActive(false);
    }

    @Transactional
    public void activate(Long id) {
        load(id).setActive(true);
    }

    private Reseller load(Long id) {
        return resellerRepository.findById(id)
                .orElseThrow(() -> new ResellerNotFoundException(id));
    }

    private ValidatedResellerData validateAndNormalize(ResellerRequest request) {
        if (request == null) {
            throw new InvalidResellerDataException("Reseller data is required.");
        }

        String name = normalizeName(request.name());
        String documentNumber = normalizeDocument(request.documentNumber());
        validateDocument(request.documentType(), documentNumber);

        return new ValidatedResellerData(name, request.documentType(), documentNumber);
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new InvalidResellerDataException("The reseller name is required.");
        }

        String normalizedName = name.trim();
        if (normalizedName.length() > 150) {
            throw new InvalidResellerDataException(
                    "The reseller name must have at most 150 characters."
            );
        }

        return normalizedName;
    }

    private String normalizeDocument(String documentNumber) {
        if (documentNumber == null || documentNumber.isBlank()) {
            throw new InvalidResellerDataException("The document number is required.");
        }

        return documentNumber.replaceAll("\\D", "");
    }

    private void validateDocument(DocumentType documentType, String documentNumber) {
        if (documentType == null) {
            throw new InvalidResellerDataException("The document type is required.");
        }

        int expectedLength = switch (documentType) {
            case CPF -> 11;
            case CNPJ -> 14;
        };

        if (documentNumber.length() != expectedLength) {
            throw new InvalidResellerDataException(
                    documentType + " must contain " + expectedLength + " digits."
            );
        }
    }

    private record ValidatedResellerData(
            String name,
            DocumentType documentType,
            String documentNumber
    ) {
    }
}
