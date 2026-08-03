package br.com.venture.ventureflow.inventory.entity;

/**
 * Units currently available for interpreting a product's quantity.
 *
 * <p>The enum is stored by name in the database. The code does not currently
 * apply unit-specific conversion or quantity rules.</p>
 */
public enum UnitOfMeasure {
	UNIT,
	METER,
	SHEET,
	SQUARE_METER,
	BOX
}
