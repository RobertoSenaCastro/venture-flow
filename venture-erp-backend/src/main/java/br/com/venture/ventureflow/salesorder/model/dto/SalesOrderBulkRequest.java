package br.com.venture.ventureflow.salesorder.model.dto;

import java.util.Set;

/**
 * Request body for moving multiple sales orders to the trash.
 *
 * <p>The service rejects a {@code null} or empty set and verifies that every
 * identifier resolves before changing any order.</p>
 *
 * @param ids unique sales-order identifiers to soft-delete
 */
public record SalesOrderBulkRequest(Set<Long> ids) {
	
}
