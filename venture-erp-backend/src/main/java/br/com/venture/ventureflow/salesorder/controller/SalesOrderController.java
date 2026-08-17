package br.com.venture.ventureflow.salesorder.controller;

import br.com.venture.ventureflow.auth.AppUserDetails;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderBulkRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderRequest;
import br.com.venture.ventureflow.salesorder.model.dto.SalesOrderResponse;
import br.com.venture.ventureflow.salesorder.model.service.SalesOrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Exposes the HTTP operations for creating, reading, updating, soft-deleting,
 * and restoring sales orders.
 *
 * <p>Business rules and persistence are delegated to {@link SalesOrderService};
 * this class is responsible only for the REST contract and status codes.</p>
 */
@RestController
@RequestMapping("/api/sales-orders")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    /**
     * Creates an active sales order associated with an active reseller.
     *
     * @param request validated order data and the required reseller identifier
     * @return the persisted order with HTTP status 201
     */
    @PostMapping
    public ResponseEntity<SalesOrderResponse> create(
            @Valid @RequestBody SalesOrderRequest request,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        SalesOrderResponse response = salesOrderService.create(request, principal);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Lists active orders using the service's newest-first ordering.
     *
     * @return active sales orders
     */
    @GetMapping
    public ResponseEntity<List<SalesOrderResponse>> findAll(
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        return ResponseEntity.ok(salesOrderService.findAll(principal));
    }

    /**
     * Retrieves an order by identifier, regardless of its active flag.
     *
     * @param id persisted sales-order identifier
     * @return the matching order
     */
    @GetMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        return ResponseEntity.ok(salesOrderService.findById(id, principal));
    }

    /**
     * Replaces the editable fields and reseller association of an existing
     * order. The referenced reseller must currently be active.
     *
     * @param id persisted sales-order identifier
     * @param request validated replacement data
     * @return the updated order
     */
    @PutMapping("/{id}")
    public ResponseEntity<SalesOrderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderRequest request,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        return ResponseEntity.ok(salesOrderService.update(id, request, principal));
    }

    /**
     * Moves an order to the trash by clearing its active flag.
     *
     * @param id persisted sales-order identifier
     * @return an empty HTTP 204 response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        salesOrderService.softDelete(id, principal);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restores an order by setting its active flag.
     *
     * @param id persisted sales-order identifier
     * @return an empty HTTP 204 response
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(
            @PathVariable Long id,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        salesOrderService.activate(id, principal);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Soft-deletes all requested orders as one service transaction.
     *
     * @param request set of identifiers to move to the trash
     * @return an empty HTTP 204 response
     */
    @PatchMapping("/bulk-soft-delete")
    public ResponseEntity<Void> softDeleteMany(
            @RequestBody SalesOrderBulkRequest request,
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        salesOrderService.softDeleteMany(request.ids(), principal);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Lists orders whose active flag is false.
     *
     * @return soft-deleted orders in newest-first order
     */
    @GetMapping("/trash")
    public ResponseEntity<List<SalesOrderResponse>> findAllSoftDeleted(
            @AuthenticationPrincipal AppUserDetails principal
    ) {
        List<SalesOrderResponse> salesOrders =
            salesOrderService.findAllSoftDeleted(principal);

        return ResponseEntity.ok(salesOrders);
    }
}
