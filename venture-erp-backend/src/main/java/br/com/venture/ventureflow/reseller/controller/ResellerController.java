package br.com.venture.ventureflow.reseller.controller;

import br.com.venture.ventureflow.reseller.model.dto.ResellerRequest;
import br.com.venture.ventureflow.reseller.model.dto.ResellerResponse;
import br.com.venture.ventureflow.reseller.model.service.ResellerService;
import br.com.venture.ventureflow.reseller.model.dto.ResellerOptionResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST entry point for reseller registration and active-reseller options.
 *
 * <p>The controller delegates normalization, document checks, uniqueness, and
 * persistence to {@link ResellerService}.</p>
 */
@RestController
@RequestMapping("/api/resellers")
public class ResellerController {

    private final ResellerService resellerService;

    public ResellerController(
            ResellerService resellerService
    ) {
        this.resellerService = resellerService;
    }

    /**
     * Registers a reseller using the service's manual validation rules.
     *
     * @param request reseller name, document type, and document number
     * @return the persisted reseller with HTTP status 201
     */
    @PostMapping
    public ResponseEntity<ResellerResponse> create(
            @RequestBody ResellerRequest request
    ) {
        ResellerResponse createdReseller =
                resellerService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdReseller);
    }
    
    /**
     * Lists active resellers as compact options ordered by name.
     *
     * @return active reseller identifiers and names
     */
    @GetMapping
    public ResponseEntity<List<ResellerOptionResponse>>
    findAllActive() {
        return ResponseEntity.ok(
            resellerService.findAllActive()
        );
    }
}
