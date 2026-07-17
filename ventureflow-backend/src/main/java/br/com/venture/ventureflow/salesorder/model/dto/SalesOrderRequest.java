package br.com.venture.ventureflow.salesorder.model.dto;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SalesOrderRequest(

        @NotBlank(message = "The sales order name is required")
        @Size(max = 150, message = "The sales order name must have at most 150 characters")
        String name,

        @Size(max = 500, message = "The description must have at most 500 characters")
        String description,

        @NotNull(message = "The sales order status is required")
        SalesOrderStatus status

) {
}
