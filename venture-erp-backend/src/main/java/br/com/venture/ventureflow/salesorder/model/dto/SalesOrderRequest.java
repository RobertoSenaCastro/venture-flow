package br.com.venture.ventureflow.salesorder.model.dto;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Input contract shared by sales-order creation and full update.
 *
 * <p>The reseller identifier is mandatory because every order must reference
 * a reseller. The service additionally requires that reseller to be active.</p>
 *
 * @param name required display name, limited to 150 characters
 * @param description optional description, limited to 500 characters
 * @param status persisted lifecycle status supplied by the caller
 * @param resellerId identifier of the reseller associated with the order
 * @param assemblySupervisorId optional assembly supervisor identifier
 */
public record SalesOrderRequest(

        @NotBlank(message = "The sales order name is required")
        @Size(max = 150, message = "The sales order name must have at most 150 characters")
        String name,

        @Size(max = 500, message = "The description must have at most 500 characters")
        String description,

        @NotNull(message = "The sales order status is required")
        SalesOrderStatus status,

        @NotNull(message = "The reseller is required")
        @Positive(message = "The reseller ID must be greater than zero")
        Long resellerId,

        @Positive(message = "The assembly supervisor ID must be greater than zero")
        Long assemblySupervisorId
) {
}
