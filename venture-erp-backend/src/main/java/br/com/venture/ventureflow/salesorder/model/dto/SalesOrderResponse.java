package br.com.venture.ventureflow.salesorder.model.dto;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;
import br.com.venture.ventureflow.salesorder.model.entity.SalesOrderStatus;

import java.time.LocalDateTime;

/**
 * Public representation of a sales order.
 *
 * <p>The reseller relationship is flattened to its identifier and name so the
 * JPA entity itself is not exposed through the API.</p>
 *
 * @param id persisted order identifier
 * @param code generated sales-order code
 * @param name order name
 * @param description optional order description
 * @param status current order status
 * @param active whether the order belongs to the active list
 * @param createdAt creation timestamp assigned by the service
 * @param resellerId associated reseller identifier
 * @param resellerName associated reseller name
 */
public record SalesOrderResponse(
	    Long id,
	    String code,
	    String name,
	    String description,
	    SalesOrderStatus status,
	    boolean active,
	    LocalDateTime createdAt,
	    Long resellerId,
	    String resellerName
	) {

	    /**
	     * Maps an entity and its required reseller association to the API
	     * response contract.
	     *
	     * @param salesOrder entity to represent
	     * @return response containing order and reseller summary data
	     */
	    public static SalesOrderResponse from(
	        SalesOrder salesOrder
	    ) {
	        return new SalesOrderResponse(
	            salesOrder.getId(),
	            salesOrder.getCode(),
	            salesOrder.getName(),
	            salesOrder.getDescription(),
	            salesOrder.getStatus(),
	            salesOrder.isActive(),
	            salesOrder.getCreatedAt(),
	            salesOrder.getReseller().getId(),
	            salesOrder.getReseller().getName()
	        );
	    }
	}
