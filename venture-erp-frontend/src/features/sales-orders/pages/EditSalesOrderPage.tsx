import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getSalesOrderById,
  updateSalesOrder,
} from "../api/salesOrderApi";

import { getActiveResellers } from
  "../../reseller/api/resellerApi";

import type { ResellerOption } from
  "../../reseller/types/reseller";

import type {
  SalesOrder,
  SalesOrderStatus,
} from "../types/salesOrder";

import "../styles/EditSalesOrderPage.css";

interface SalesOrderEditFormData {
  name: string;
  description: string;
  status: SalesOrderStatus;

  // Select elements store their values as strings.
  // The value is converted to a number before calling the backend.
  resellerId: string;
}

const INITIAL_FORM_DATA: SalesOrderEditFormData = {
  name: "",
  description: "",
  status: "CREATED",
  resellerId: "",
};

function SalesOrderEditPage() {
  const navigate = useNavigate();

  const { salesOrderId } = useParams<{
    salesOrderId: string;
  }>();

  const [salesOrder, setSalesOrder] =
    useState<SalesOrder | null>(null);

  const [resellers, setResellers] =
    useState<ResellerOption[]>([]);

  const [formData, setFormData] =
    useState<SalesOrderEditFormData>(
      INITIAL_FORM_DATA,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    submitErrorMessage,
    setSubmitErrorMessage,
  ] = useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadPageData(): Promise<void> {
      const parsedSalesOrderId =
        Number(salesOrderId);

      if (
        !salesOrderId ||
        Number.isNaN(parsedSalesOrderId)
      ) {
        setErrorMessage(
          "Invalid sales order ID.",
        );

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        /*
         * The form needs the order and the reseller options.
         * Loading both requests together avoids waiting for one
         * request to finish before starting the other.
         */
        const [
          loadedSalesOrder,
          activeResellers,
        ] = await Promise.all([
          getSalesOrderById(
            parsedSalesOrderId,
          ),
          getActiveResellers(),
        ]);

        /*
         * The component may be unmounted before the requests finish.
         * In that case, the result should not update its state.
         */
        if (isCancelled) {
          return;
        }

        setSalesOrder(loadedSalesOrder);
        setResellers(activeResellers);

        setFormData({
          name: loadedSalesOrder.name,
          description:
            loadedSalesOrder.description || "",
          status: loadedSalesOrder.status,
          resellerId: String(
            loadedSalesOrder.resellerId,
          ),
        });
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "An unexpected error occurred while loading the sales order.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [salesOrderId]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >,
  ): void {
    const { name, value } = event.target;

    setFormData((currentFormData) => {
      if (name === "status") {
        return {
          ...currentFormData,
          status: value as SalesOrderStatus,
        };
      }

      return {
        ...currentFormData,
        [name]: value,
      };
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const parsedSalesOrderId =
      Number(salesOrderId);

    const trimmedName =
      formData.name.trim();

    const trimmedDescription =
      formData.description.trim();

    if (
      !salesOrderId ||
      Number.isNaN(parsedSalesOrderId)
    ) {
      setSubmitErrorMessage(
        "Invalid sales order ID.",
      );

      return;
    }

    if (!trimmedName) {
      setSubmitErrorMessage(
        "The sales order name is required.",
      );

      return;
    }

    if (!formData.resellerId) {
      setSubmitErrorMessage(
        "A reseller must be selected.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");
      setSuccessMessage("");

      const updatedSalesOrder =
        await updateSalesOrder(
          parsedSalesOrderId,
          {
            name: trimmedName,
            description: trimmedDescription,
            status: formData.status,

            // The backend expects a numeric reseller identifier.
            resellerId: Number(formData.resellerId),
          },
        );

      setSalesOrder(updatedSalesOrder);

      setFormData({
        name: updatedSalesOrder.name,
        description:
          updatedSalesOrder.description || "",
        status: updatedSalesOrder.status,
        resellerId: String(
          updatedSalesOrder.resellerId,
        ),
      });

      setSuccessMessage(
        "Sales order updated successfully.",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitErrorMessage(
          error.message,
        );
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
    <main className="page edit-sales-order-page">
      <header className="edit-sales-order-header">
        <p className="eyebrow">
          Sales orders
        </p>

        <h1>Edit sales order</h1>

        <p className="page-description">
          Update the basic information,
          reseller, and current order status.
        </p>
      </header>

      {isLoading && (
        <section className="edit-sales-order-card">
          Loading sales order...
        </section>
      )}

      {errorMessage && (
        <section
          className="edit-sales-order-message edit-sales-order-error"
          role="alert"
        >
          {errorMessage}
        </section>
      )}

      {!isLoading &&
        !errorMessage &&
        salesOrder && (
          <form
            className={
              "edit-sales-order-card " +
              "edit-sales-order-form"
            }
            onSubmit={handleSubmit}
          >
            <div className="edit-sales-order-summary">
              <div>
                <span>Order code</span>
                <strong>
                  {salesOrder.code}
                </strong>
              </div>

              <div>
                <span>Current reseller</span>
                <strong>
                  {salesOrder.resellerName}
                </strong>
              </div>
            </div>

            <div className="edit-sales-order-field">
              <label htmlFor="name">
                Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={150}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="edit-sales-order-field">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                disabled={isSubmitting}
              />
            </div>

            <div className="edit-sales-order-field">
              <label htmlFor="resellerId">
                Reseller
              </label>

              <select
                id="resellerId"
                name="resellerId"
                value={formData.resellerId}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              >
                <option value="">
                  Select a reseller
                </option>

                {resellers.map((reseller) => (
                  <option
                    key={reseller.id}
                    value={reseller.id}
                  >
                    {reseller.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-sales-order-field">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isSubmitting}
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
              <div
                className="edit-sales-order-message edit-sales-order-error"
                role="alert"
              >
                {submitErrorMessage}
              </div>
            )}

            {successMessage && (
              <div
                className="edit-sales-order-message edit-sales-order-success"
                role="status"
              >
                {successMessage}
              </div>
            )}

            <div className="edit-sales-order-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  navigate("/orders");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={
                  isSubmitting ||
                  !formData.name.trim() ||
                  !formData.resellerId
                }
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