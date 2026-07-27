package br.com.venture.ventureflow.reseller.controller;

import br.com.venture.ventureflow.reseller.model.dto.ResellerRequest;
import br.com.venture.ventureflow.reseller.model.dto.ResellerResponse;
import br.com.venture.ventureflow.reseller.model.service.ResellerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/resellers")
public class ResellerController {

    private final ResellerService resellerService;

    public ResellerController(
            ResellerService resellerService
    ) {
        this.resellerService = resellerService;
    }

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
}