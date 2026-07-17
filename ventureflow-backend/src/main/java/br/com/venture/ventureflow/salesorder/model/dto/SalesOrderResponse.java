package br.com.venture.ventureflow.salesorder.model.dto;

import br.com.venture.ventureflow.salesorder.model.entity.SalesOrder;
import br.com.venture.ventureflow.salesorder.model.entity.SalesOrderStatus;

import java.time.LocalDateTime;

public record SalesOrderResponse(
        Long id,
        String code,
        String name,
        String description,
        SalesOrderStatus status,
        LocalDateTime createdAt,
        boolean active
) {
    public static SalesOrderResponse from(SalesOrder salesOrder) {
        return new SalesOrderResponse(
                salesOrder.getId(),
                salesOrder.getCode(),
                salesOrder.getName(),
                salesOrder.getDescription(),
                salesOrder.getStatus(),
                salesOrder.getCreatedAt(),
                salesOrder.isActive()
        );
    }
}
