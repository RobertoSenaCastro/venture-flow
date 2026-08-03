package br.com.venture.ventureflow.reseller.model.entity;

/**
 * Brazilian document classifications accepted for resellers.
 *
 * <p>{@link #CPF} requires 11 normalized digits and {@link #CNPJ} requires 14.
 * The current validation checks length only, not official check digits.</p>
 */
public enum DocumentType {
	CPF,
	CNPJ
}
