package br.com.venture.ventureflow.inventory.model.entity;

/**
 * Unit used to store and move an item.
 *
 * <p>Only the stock unit is modeled at this stage. Purchase and consumption units
 * (and their conversion factors) are a pending decision.
 */
public enum MeasurementUnit {
    UNIT,
    METER,
    SHEET,
    SQUARE_METER,
    BOX
}
