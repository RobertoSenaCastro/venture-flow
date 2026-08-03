import type { ChangeEvent } from "react";

import type { Category } from "../types/category";

import {
  MEASUREMENT_UNITS,
  MEASUREMENT_UNIT_LABELS,
  type ItemFormData,
  type MeasurementUnit,
} from "../types/item";

interface ItemFormFieldsProps {
  formData: ItemFormData;
  categories: Category[];
  isCategoryListLoading: boolean;
  isSubmitting: boolean;

  onChange: (formData: ItemFormData) => void;
}

/**
 * Field set shared by the create and edit pages.
 *
 * The component is fully controlled: it never keeps its own state and
 * always reports a complete new form object to the parent page.
 */
function ItemFormFields({
  formData,
  categories,
  isCategoryListLoading,
  isSubmitting,
  onChange,
}: ItemFormFieldsProps) {
  function handleTextChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void {
    const { name, value } = event.target;

    onChange({
      ...formData,
      [name]: value,
    });
  }

  function handleUnitChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    onChange({
      ...formData,
      unit: event.target.value as MeasurementUnit,
    });
  }

  function toggleCategory(categoryId: number): void {
    const isSelected =
      formData.categoryIds.includes(categoryId);

    onChange({
      ...formData,
      categoryIds: isSelected
        ? formData.categoryIds.filter(
            (selectedId) => selectedId !== categoryId,
          )
        : [...formData.categoryIds, categoryId],
    });
  }

  function addAlias(): void {
    onChange({
      ...formData,
      aliases: [
        ...formData.aliases,
        { code: "", source: "" },
      ],
    });
  }

  function updateAlias(
    aliasIndex: number,
    field: "code" | "source",
    value: string,
  ): void {
    onChange({
      ...formData,
      aliases: formData.aliases.map(
        (alias, currentIndex) =>
          currentIndex === aliasIndex
            ? { ...alias, [field]: value }
            : alias,
      ),
    });
  }

  function removeAlias(aliasIndex: number): void {
    onChange({
      ...formData,
      aliases: formData.aliases.filter(
        (_alias, currentIndex) =>
          currentIndex !== aliasIndex,
      ),
    });
  }

  return (
    <>
      <div className="item-form-row">
        <div className="item-form-field">
          <label htmlFor="code">Code</label>

          <input
            id="code"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleTextChange}
            maxLength={50}
            disabled={isSubmitting}
            required
          />

          <p className="item-form-hint">
            Saved in upper case.
          </p>
        </div>

        <div className="item-form-field">
          <label htmlFor="unit">Unit</label>

          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleUnitChange}
            disabled={isSubmitting}
            required
          >
            {MEASUREMENT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {MEASUREMENT_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="item-form-field">
        <label htmlFor="name">Name</label>

        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleTextChange}
          maxLength={150}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="item-form-field">
        <label htmlFor="description">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleTextChange}
          maxLength={500}
          disabled={isSubmitting}
        />
      </div>

      <div className="item-form-field">
        <span className="item-form-label">
          Categories
        </span>

        {isCategoryListLoading && (
          <p className="item-form-hint">
            Loading categories...
          </p>
        )}

        {!isCategoryListLoading &&
          categories.length === 0 && (
            <p className="item-form-hint">
              No category registered yet. Create one
              before registering items.
            </p>
          )}

        {categories.length > 0 && (
          <div className="item-form-categories">
            {categories.map((category) => (
              <label
                key={category.id}
                className="item-form-checkbox"
              >
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(
                    category.id,
                  )}
                  onChange={() => {
                    toggleCategory(category.id);
                  }}
                  disabled={isSubmitting}
                />

                {category.name}
              </label>
            ))}
          </div>
        )}

        <p className="item-form-hint">
          At least one category is required.
        </p>
      </div>

      <div className="item-form-field">
        <span className="item-form-label">
          Alternative codes
        </span>

        <p className="item-form-hint">
          Codes used by suppliers or by external
          systems. The same code may exist for
          different sources.
        </p>

        {formData.aliases.map((alias, aliasIndex) => (
          <div
            // The list has no stable identifier before saving,
            // so the position is the only key available.
            key={aliasIndex}
            className="item-form-alias-row"
          >
            <input
              type="text"
              value={alias.source}
              onChange={(event) => {
                updateAlias(
                  aliasIndex,
                  "source",
                  event.target.value,
                );
              }}
              placeholder="Source"
              maxLength={100}
              disabled={isSubmitting}
              aria-label={
                `Source of alternative code ${aliasIndex + 1}`
              }
            />

            <input
              type="text"
              value={alias.code}
              onChange={(event) => {
                updateAlias(
                  aliasIndex,
                  "code",
                  event.target.value,
                );
              }}
              placeholder="Code"
              maxLength={50}
              disabled={isSubmitting}
              aria-label={
                `Alternative code ${aliasIndex + 1}`
              }
            />

            <button
              type="button"
              className="item-form-alias-remove"
              onClick={() => {
                removeAlias(aliasIndex);
              }}
              disabled={isSubmitting}
              aria-label={
                `Remove alternative code ${aliasIndex + 1}`
              }
            >
              ×
            </button>
          </div>
        ))}

        <button
          type="button"
          className="item-form-alias-add"
          onClick={addAlias}
          disabled={isSubmitting}
        >
          Add alternative code
        </button>
      </div>
    </>
  );
}

export default ItemFormFields;
