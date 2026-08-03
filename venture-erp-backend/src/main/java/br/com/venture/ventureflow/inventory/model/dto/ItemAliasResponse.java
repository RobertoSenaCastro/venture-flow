package br.com.venture.ventureflow.inventory.model.dto;

import br.com.venture.ventureflow.inventory.model.entity.ItemAlias;

public record ItemAliasResponse(Long id, String code, String source) {

    public static ItemAliasResponse from(ItemAlias alias) {
        return new ItemAliasResponse(alias.getId(), alias.getCode(), alias.getSource());
    }
}
