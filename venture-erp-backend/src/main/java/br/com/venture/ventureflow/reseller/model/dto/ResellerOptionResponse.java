package br.com.venture.ventureflow.reseller.model.dto;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;

/**
 * Compact reseller representation used when selecting an active reseller for
 * a sales order.
 *
 * @param id persisted reseller identifier
 * @param name reseller display name
 */
public record ResellerOptionResponse(
    Long id,
    String name
) {

    /**
     * Maps an active reseller entity to its selection option.
     *
     * @param reseller entity returned by the active-only repository query
     * @return identifier and display name
     */
    public static ResellerOptionResponse from(
        Reseller reseller
    ) {
        return new ResellerOptionResponse(
            reseller.getId(),
            reseller.getName()
        );
    }
}
