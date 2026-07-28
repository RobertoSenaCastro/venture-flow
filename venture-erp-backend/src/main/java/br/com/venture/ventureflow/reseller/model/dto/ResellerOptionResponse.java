package br.com.venture.ventureflow.reseller.model.dto;

import br.com.venture.ventureflow.reseller.model.entity.Reseller;

public record ResellerOptionResponse(
    Long id,
    String name
) {

    public static ResellerOptionResponse from(
        Reseller reseller
    ) {
        return new ResellerOptionResponse(
            reseller.getId(),
            reseller.getName()
        );
    }
}