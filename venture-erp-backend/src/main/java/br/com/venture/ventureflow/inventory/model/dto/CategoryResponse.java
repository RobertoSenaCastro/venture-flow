package br.com.venture.ventureflow.inventory.model.dto;

import br.com.venture.ventureflow.inventory.model.entity.Category;

import java.time.LocalDateTime;

public record CategoryResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getDescription(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
