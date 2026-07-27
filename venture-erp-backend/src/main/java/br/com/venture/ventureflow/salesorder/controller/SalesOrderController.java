package br.com.venture.ventureflow.salesorder.controller;

import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderBulkRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderResponse;
import br.com.venture.ventureflow.salesorder.model.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @PostMapping
    public ResponseEntity<SalesOrderResponse> create(
            @Valid @RequestBody SalesOrderRequest request
    ) {
        SalesOrderResponse response = salesOrderService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<SalesOrderResponse>> findAll() {
        return ResponseEntity.ok(salesOrderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> findById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(salesOrderService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderRequest request
    ) {
        return ResponseEntity.ok(salesOrderService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {
        salesOrderService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(
            @PathVariable Long id
    ) {
        salesOrderService.activate(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/bulk-soft-delete")
    public ResponseEntity<Void> softDeleteMany(
            @RequestBody SalesOrderBulkRequest request
    ) {
        salesOrderService.softDeleteMany(request.ids());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/trash")
    public ResponseEntity<List<SalesOrderResponse>> findAllSoftDeleted() {
        List<SalesOrderResponse> salesOrders =
            salesOrderService.findAllSoftDeleted();

        return ResponseEntity.ok(salesOrders);
    }
}
