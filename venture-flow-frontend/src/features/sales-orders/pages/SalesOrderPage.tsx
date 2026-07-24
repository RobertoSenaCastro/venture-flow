import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useNavigate, Link, } from "react-router-dom";

import {
  createSalesOrder,
  getSalesOrders,
  softDeleteSalesOrder,
} from "../api/salesOrderApi";

import SalesOrderForm from "../components/SalesOrderForm";
import "./SalesOrderPage.css";

import type {
  SalesOrder,
  SalesOrderFormData,
} from "../types/salesOrder";

const INITIAL_FORM_DATA: SalesOrderFormData = {
  name: "",
  description: "",
};

function SalesOrdersPage() {

  const [openMenuSalesOrderId, setOpenMenuSalesOrderId] =
    useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState<boolean>(false);

  const [formData, setFormData] =
    useState<SalesOrderFormData>(INITIAL_FORM_DATA);

  const [salesOrder, setSalesOrder] =
    useState<SalesOrder | null>(null);

  const [salesOrders, setSalesOrders] =
    useState<SalesOrder[]>([]);

  const [errorMessage, setErrorMessage] =
    useState<string>("");

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const navigate =
    useNavigate();

  const [deletingSalesOrderId, setDeletingSalesOrderId] =
    useState<number | null>(null);

  const [deleteErrorMessage, setDeleteErrorMessage] =
    useState<string>("");

  useEffect(() => {
    async function loadSalesOrders(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      try {
        const loadedSalesOrders = await getSalesOrders();

        setSalesOrders(loadedSalesOrders);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setLoadErrorMessage(error.message);
        } else {
          setLoadErrorMessage(
            "An unexpected error occurred while loading sales orders.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadSalesOrders();
  }, []);

  function handleEditSalesOrder(salesOrderId: number): void {
    setOpenMenuSalesOrderId(null);
    navigate(`/sales-orders/${salesOrderId}/edit`);
  }

  function toggleSalesOrderMenu(
    salesOrderId: number
  ): void {
    setOpenMenuSalesOrderId((currentOpenMenuId) => {
      if (currentOpenMenuId === salesOrderId) {
        return null;
      }

      return salesOrderId;
    });
  }

  function openForm(): void {
    setErrorMessage("");
    setIsFormOpen(true);
  }

  function closeForm(): void {
    if (isSubmitting) {
      return;
    }

    setIsFormOpen(false);
    setErrorMessage("");
    setFormData(INITIAL_FORM_DATA);
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      setErrorMessage("The sales order name is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSalesOrder(null);

    try {
      const createdSalesOrder = await createSalesOrder({
        name: trimmedName,
        description: trimmedDescription,
        status: "CREATED",
      });

      setSalesOrder(createdSalesOrder);

      setSalesOrders((currentSalesOrders) => [
        createdSalesOrder,
        ...currentSalesOrders,
      ]);

      setFormData(INITIAL_FORM_DATA);
      setIsFormOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSoftDeleteSalesOrder(
    salesOrder: SalesOrder,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Do you want to remove ${salesOrder.code} — ${salesOrder.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingSalesOrderId(salesOrder.id);
    setDeleteErrorMessage("");
    setOpenMenuSalesOrderId(null);

    try {
      await softDeleteSalesOrder(salesOrder.id);

      setSalesOrders((currentSalesOrders) =>
        currentSalesOrders.filter(
          (currentSalesOrder) =>
            currentSalesOrder.id !== salesOrder.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setDeleteErrorMessage(error.message);
      } else {
        setDeleteErrorMessage(
          "An unexpected error occurred while removing the sales order.",
        );
      }
    } finally {
      setDeletingSalesOrderId(null);
    }
  }

  return (
    <main className="page">
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Management</p>

          <h1>Pedido de Venda</h1>

          <p className="page-description">
            Create and manage customer sales orders.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to="/sales-orders/trash"
            className="secondary-button trash-link"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>

            Lixeira
          </Link>

          <button
            type="button"
            className="primary-button"
            onClick={openForm}
          >
            Novo Pedido
          </button>
        </div>
      </header>

      {salesOrder && (
        <section className="success-message" role="status">
          <strong>Sales order created successfully.</strong>

          <span>
            {salesOrder.code} — {salesOrder.name}
          </span>
        </section>
      )}

      {isLoading && (
        <section className="details-card">
          Loading sales orders...
        </section>
      )}

      {loadErrorMessage && (
        <section className="error-message" role="alert">
          {loadErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        salesOrders.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">▤</div>

            <h2>No sales orders found</h2>

            <p>
              Click <strong>New sales order</strong> to register one.
            </p>
          </section>
        )}

      {deleteErrorMessage && (
        <section className="error-message" role="alert">
          {deleteErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        salesOrders.length > 0 && (
          <section className="sales-orders-list">
            {salesOrders.map((salesOrder) => (
              <article
                className="sales-order-card"
                key={salesOrder.id}
              >
                <div>
                  <strong>{salesOrder.code}</strong>
                  <h2>{salesOrder.name}</h2>

                  <p>
                    {salesOrder.description || "No description"}
                  </p>
                </div>

                <div className="sales-order-card-side">
                  <span>{salesOrder.status}</span>


                  <div className="sales-order-actions">

                    <button
                      type="button"
                      className="sales-order-menu-button"
                      onClick={() => {
                        toggleSalesOrderMenu(salesOrder.id);
                      }}
                      aria-label={
                        `Open options for ${salesOrder.name}`
                      }
                      aria-expanded={
                        openMenuSalesOrderId === salesOrder.id
                      }
                    >
                      ⋮
                    </button>

                    {openMenuSalesOrderId === salesOrder.id && (
                      <div className="sales-order-menu">
                        <button
                          type="button"
                          className="sales-order-menu-item"
                          onClick={() => {
                            handleEditSalesOrder(salesOrder.id);
                          }}
                        >
                          Editar PV
                        </button>

                        <button
                          type="button"
                          className="sales-order-menu-item sales-order-menu-item-danger"
                          onClick={() => {
                            void handleSoftDeleteSalesOrder(salesOrder);
                          }}
                          disabled={
                            deletingSalesOrderId === salesOrder.id
                          }
                        >
                          {deletingSalesOrderId === salesOrder.id
                            ? "Removing..."
                            : "Deletar"}
                        </button>

                      </div>
                    )}

                  </div>
                </div>
              </article>
            ))}
          </section>
        )
      }

      <SalesOrderForm
        isOpen={isFormOpen}
        formData={formData}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onChange={handleInputChange}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </main>
  );
}

export default SalesOrdersPage;