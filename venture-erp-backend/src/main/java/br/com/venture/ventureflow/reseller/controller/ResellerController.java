package br.com.venture.ventureflow.reseller.controller;

import br.com.venture.ventureflow.reseller.model.dto.ResellerOptionResponse;
import br.com.venture.ventureflow.reseller.model.dto.ResellerRequest;
import br.com.venture.ventureflow.reseller.model.dto.ResellerResponse;
import br.com.venture.ventureflow.reseller.model.service.ResellerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/resellers")
public class ResellerController {

    private final ResellerService resellerService;

    public ResellerController(ResellerService resellerService) {
        this.resellerService = resellerService;
    }

    @PostMapping
    public ResponseEntity<ResellerResponse> create(@RequestBody ResellerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resellerService.create(request));
    }

    /** Preserves the compact contract used by sales-order reseller selects. */
    @GetMapping
    public ResponseEntity<List<ResellerOptionResponse>> findAllActiveOptions() {
        return ResponseEntity.ok(resellerService.findAllActiveOptions());
    }

    /** Full active records for the reseller administration screen. */
    @GetMapping("/details")
    public ResponseEntity<List<ResellerResponse>> findAllActive() {
        return ResponseEntity.ok(resellerService.findAllActive());
    }

    @GetMapping("/trash")
    public ResponseEntity<List<ResellerResponse>> findAllInactive() {
        return ResponseEntity.ok(resellerService.findAllInactive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResellerResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(resellerService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResellerResponse> update(
            @PathVariable Long id,
            @RequestBody ResellerRequest request
    ) {
        return ResponseEntity.ok(resellerService.update(id, request));
    }

    /** Soft delete. There is no physical delete endpoint. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        resellerService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        resellerService.activate(id);
        return ResponseEntity.noContent().build();
    }
}
