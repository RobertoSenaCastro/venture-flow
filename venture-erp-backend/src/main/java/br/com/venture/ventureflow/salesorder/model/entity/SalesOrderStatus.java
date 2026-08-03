package br.com.venture.ventureflow.salesorder.model.entity;

/**
 * Persisted lifecycle labels accepted for a sales order.
 *
 * <p>The current implementation allows callers to choose any value on create
 * and to change directly between values on update; no transition matrix is
 * enforced.</p>
 */
public enum SalesOrderStatus {
    CREATED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
