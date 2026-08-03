export type MeasurementUnit =
  | "UNIT"
  | "METER"
  | "SHEET"
  | "SQUARE_METER"
  | "BOX";

/**
 * Labels shown in the interface. The keys must stay in sync with the
 * MeasurementUnit enum on the backend.
 */
export const MEASUREMENT_UNIT_LABELS: Record<
  MeasurementUnit,
  string
> = {
  UNIT: "Unit",
  METER: "Meter",
  SHEET: "Sheet",
  SQUARE_METER: "Square meter",
  BOX: "Box",
};

export const MEASUREMENT_UNITS: MeasurementUnit[] =
  Object.keys(
    MEASUREMENT_UNIT_LABELS,
  ) as MeasurementUnit[];

export interface ItemAlias {
  id: number;
  code: string;
  source: string;
}

export interface ItemAliasRequest {
  code: string;
  source: string;
}

export interface ItemCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  code: string;
  name: string;
  description: string | null;

  unit: MeasurementUnit;

  // Sent by the backend as a JSON number with up to three decimal places.
  quantity: number;

  active: boolean;
  createdAt: string;
  updatedAt: string;

  categories: ItemCategory[];
  aliases: ItemAlias[];
}

/**
 * Shared create/update contract.
 *
 * Quantity is absent on purpose: the balance only changes through
 * PATCH /api/items/{id}/quantity, never through a catalog edit.
 */
export interface ItemRequest {
  code: string;
  description: string;
  name: string;
  unit: MeasurementUnit;
  categoryIds: number[];
  aliases: ItemAliasRequest[];
}

export interface QuantityAdjustmentRequest {
  quantity: number;
  reason: string;
}

/**
 * Form state for the create and edit pages.
 *
 * Every field is a string because HTML inputs and selects always
 * store their values as text.
 */
export interface ItemFormData {
  code: string;
  name: string;
  description: string;
  unit: MeasurementUnit;
  categoryIds: number[];
  aliases: ItemAliasRequest[];
}

export const INITIAL_ITEM_FORM_DATA: ItemFormData = {
  code: "",
  name: "",
  description: "",
  unit: "UNIT",
  categoryIds: [],
  aliases: [],
};
