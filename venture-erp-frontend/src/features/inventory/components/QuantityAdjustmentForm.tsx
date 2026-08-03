import type { FormEvent } from "react";

import {
  MEASUREMENT_UNIT_LABELS,
  type Item,
} from "../types/item";

import "../../../styles/modal.css";
import "../styles/QuantityAdjustmentForm.css";

interface QuantityAdjustmentFormProps {
  item: Item | null;
  quantity: string;
  reason: string;
  isSubmitting: boolean;
  errorMessage: string;

  onQuantityChange: (quantity: string) => void;
  onReasonChange: (reason: string) => void;
  onClose: () => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

/**
 * Absolute stock count correction.
 *
 * The reason is mandatory because it becomes the description of the
 * movement record once the ledger exists on the backend.
 */
function QuantityAdjustmentForm({
  item,
  quantity,
  reason,
  isSubmitting,
  errorMessage,
  onQuantityChange,
  onReasonChange,
  onClose,
  onSubmit,
}: QuantityAdjustmentFormProps) {
  if (!item) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quantity-adjustment-title"
      >
        <div className="modal-header">
          <h2 id="quantity-adjustment-title">
            Adjust quantity
          </h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close quantity form"
          >
            ×
          </button>
        </div>

        <div className="quantity-adjustment-summary">
          <div>
            <span>Item</span>
            <strong>
              {item.code} — {item.name}
            </strong>
          </div>

          <div>
            <span>Current quantity</span>
            <strong>
              {item.quantity}{" "}
              {MEASUREMENT_UNIT_LABELS[item.unit]}
            </strong>
          </div>
        </div>

        <form
          className="quantity-adjustment-form"
          onSubmit={onSubmit}
        >
          <label htmlFor="quantity">
            New quantity

            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="0.001"
              value={quantity}
              onChange={(event) => {
                onQuantityChange(event.target.value);
              }}
              disabled={isSubmitting}
              required
            />
          </label>

          <label htmlFor="reason">
            Reason

            <textarea
              id="reason"
              name="reason"
              value={reason}
              onChange={(event) => {
                onReasonChange(event.target.value);
              }}
              maxLength={255}
              placeholder="Physical count, purchase entry, production consumption..."
              disabled={isSubmitting}
              required
            />
          </label>

          {errorMessage && (
            <div
              className="error-message"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting ||
                quantity === "" ||
                !reason.trim()
              }
            >
              {isSubmitting
                ? "Saving..."
                : "Save quantity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuantityAdjustmentForm;
