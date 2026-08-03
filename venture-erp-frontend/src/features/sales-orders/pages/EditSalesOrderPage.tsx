import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams } from "react-router-dom";

import { getSalesOrderById, updateSalesOrder } from "../api/salesOrderApi";

import type { SalesOrder, SalesOrderStatus } from "../types/salesOrder";

interface SalesOrderEditFormData {
  name: string;
  description: string;
  status: SalesOrderStatus;
}

const INITIAL_FORM_DATA: SalesOrderEditFormData = {
  name: "",
  description: "",
  status: "CREATED",
};

function SalesOrderEditPage() {
  const { salesOrderId } = useParams<{
    salesOrderId: string;
  }>();

  const [salesOrder, setSalesOrder] =
    useState<SalesOrder | null>(null);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [errorMessage, setErrorMessage] =
    useState<string>("");

  const [formData, setFormData] =
    useState<SalesOrderEditFormData>(INITIAL_FORM_DATA);

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [submitErrorMessage, setSubmitErrorMessage] =
    useState<string>("");

  const [successMessage, setSuccessMessage] =
    useState<string>("");

  useEffect(() => {
    async function loadSalesOrder(): Promise<void> {
      const parsedSalesOrderId = Number(salesOrderId);

      if (
        !salesOrderId ||
        Number.isNaN(parsedSalesOrderId)
      ) {
        setErrorMessage("Invalid sales order ID.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const loadedSalesOrder =
          await getSalesOrderById(parsedSalesOrderId);

        setSalesOrder(loadedSalesOrder);

        setFormData({
          name: loadedSalesOrder.name,
          description: loadedSalesOrder.description || "",
          status: loadedSalesOrder.status,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "An unexpected error occurred while loading the sales order.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadSalesOrder();
  }, [salesOrderId]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >,
  ): void {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const parsedSalesOrderId = Number(salesOrderId);
    const trimmedName = formData.name.trim();
    const trimmedDescription =
      formData.description.trim();

    if (
      !salesOrderId ||
      Number.isNaN(parsedSalesOrderId)
    ) {
      setSubmitErrorMessage("Invalid sales order ID.");
      return;
    }

    if (!trimmedName) {
      setSubmitErrorMessage(
        "The sales order name is required.",
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedSalesOrder =
        await updateSalesOrder(parsedSalesOrderId, {
          name: trimmedName,
          description: trimmedDescription,
          status: formData.status,
        });

      setSalesOrder(updatedSalesOrder);

      setFormData({
        name: updatedSalesOrder.name,
        description:
          updatedSalesOrder.description || "",
        status: updatedSalesOrder.status,
      });

      setSuccessMessage(
        "Sales order updated successfully.",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitErrorMessage(error.message);
      } else {
        setSubmitErrorMessage(
          "An unexpected error occurred while updating the sales order.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Sales orders</p>

        <h1>Edit sales order</h1>
      </header>

      {isLoading && (
        <section className="details-card">
          Loading sales order...
        </section>
      )}

      {errorMessage && (
        <section className="error-message" role="alert">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && salesOrder && (
        <form
          className="details-card"
          onSubmit={handleSubmit}
        >
          <h2>{salesOrder.code}</h2>

          <div className="form-field">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="CREATED">
                Created
              </option>

              <option value="IN_PROGRESS">
                In progress
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          {submitErrorMessage && (
            <div className="error-message" role="alert">
              {submitErrorMessage}
            </div>
          )}

          {successMessage && (
            <div className="success-message" role="status">
              {successMessage}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default SalesOrderEditPage;