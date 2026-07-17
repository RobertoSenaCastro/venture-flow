import type {
  ChangeEvent,
  FormEvent,
} from "react";

interface SalesOrderFormData {
  name: string;
  description: string;
}

interface SalesOrderFormProps {
  isOpen: boolean;
  formData: SalesOrderFormData;
  isSubmitting: boolean;
  errorMessage: string;

  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;

  onClose: () => void;

  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}

function SalesOrderForm({
  isOpen,
  formData,
  isSubmitting,
  errorMessage,
  onChange,
  onClose,
  onSubmit,
}: SalesOrderFormProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-sales-order-title"
      >
        <div className="modal-header">
          <h2 id="create-sales-order-title">
            Create new sales order
          </h2>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close sales order form"
          >
            ×
          </button>
        </div>

        <form
          className="sales-order-form"
          onSubmit={onSubmit}
        >
          <label>
            Sales order name

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              required
              disabled={isSubmitting}
            />
          </label>

          <label>
            Description

            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              disabled={isSubmitting}
            />
          </label>

          {errorMessage && (
            <div className="error-message" role="alert">
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
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating..."
                : "Create sales order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalesOrderForm;