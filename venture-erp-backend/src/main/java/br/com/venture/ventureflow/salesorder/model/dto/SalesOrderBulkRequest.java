package br.com.venture.ventureflow.salesorder.model.dto;

import java.util.Set;

public record SalesOrderBulkRequest(Set<Long> ids) {
	
}
