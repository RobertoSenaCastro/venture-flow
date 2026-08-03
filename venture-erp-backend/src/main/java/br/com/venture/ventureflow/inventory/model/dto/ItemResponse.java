package br.com.venture.ventureflow.inventory.model.dto;

import br.com.venture.ventureflow.inventory.model.entity.Category;
import br.com.venture.ventureflow.inventory.model.entity.Item;
import br.com.venture.ventureflow.inventory.model.entity.ItemAlias;
import br.com.venture.ventureflow.inventory.model.entity.MeasurementUnit;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/** Requires categories and aliases to be initialized: load the item through an entity graph. */
public record ItemResponse(
        Long id,
        String code,
        String name,
        String description,
        MeasurementUnit unit,
        BigDecimal quantity,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CategoryResponse> categories,
        List<ItemAliasResponse> aliases
) {

    private static final Comparator<Category> BY_CATEGORY_NAME =
            Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER);

    private static final Comparator<ItemAlias> BY_SOURCE_THEN_CODE =
            Comparator.comparing(ItemAlias::getSource, String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(ItemAlias::getCode, String.CASE_INSENSITIVE_ORDER);

    public static ItemResponse from(Item item) {
        List<CategoryResponse> categories = item.getCategories().stream()
                .sorted(BY_CATEGORY_NAME)
                .map(CategoryResponse::from)
                .toList();

        List<ItemAliasResponse> aliases = item.getAliases().stream()
                .sorted(BY_SOURCE_THEN_CODE)
                .map(ItemAliasResponse::from)
                .toList();

        return new ItemResponse(
                item.getId(),
                item.getCode(),
                item.getName(),
                item.getDescription(),
                item.getUnit(),
                item.getQuantity(),
                item.isActive(),
                item.getCreatedAt(),
                item.getUpdatedAt(),
                categories,
                aliases
        );
    }
}
