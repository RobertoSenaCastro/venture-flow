import "../styles/SalesOrderPage.css";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import BackButton from
  "../../../shared/components/BackButton";
import ActionMenu from
  "../../../shared/components/ActionMenu";

import {
  getSalesOrders,
  softDeleteSalesOrder,
} from "../api/salesOrderApi";

import type { SalesOrder } from
  "../types/salesOrder";

function SalesOrdersPage() {
  const navigate = useNavigate();

  const [salesOrders, setSalesOrders] =
    useState<SalesOrder[]>([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const [
    deletingSalesOrderId,
    setDeletingSalesOrderId,
  ] = useState<number | null>(null);

  const [deleteErrorMessage, setDeleteErrorMessage] =
    useState<string>("");

  useEffect(() => {
    async function loadSalesOrders(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      try {
        const loadedSalesOrders =
          await getSalesOrders();

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

  function handleCreateSalesOrder(): void {
    navigate("/sales-orders/new");
  }

  function handleEditSalesOrder(
    salesOrderId: number,
  ): void {
    navigate(
      `/sales-orders/${salesOrderId}/edit`,
    );
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

    try {
      await softDeleteSalesOrder(salesOrder.id);

      // Remove the deleted order from the current list without
      // requesting the complete list from the backend again.
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
      <BackButton to="/" label="Home" />

      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">
            Management
          </p>

          <h1>Pedido de Venda</h1>

          <p className="page-description">
            Create and manage customer sales
            orders.
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
            onClick={handleCreateSalesOrder}
          >
            Novo Pedido
          </button>
        </div>
      </header>

      {isLoading && (
        <section className="details-card">
          Loading sales orders...
        </section>
      )}

      {loadErrorMessage && (
        <section
          className="error-message"
          role="alert"
        >
          {loadErrorMessage}
        </section>
      )}

      {deleteErrorMessage && (
        <section
          className="error-message"
          role="alert"
        >
          {deleteErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        salesOrders.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">
              ▤
            </div>

            <h2>No sales orders found</h2>

            <p>
              Click{" "}
              <strong>New sales order</strong>{" "}
              to register one.
            </p>
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
                  <strong>
                    {salesOrder.code}
                  </strong>

                  <h2>{salesOrder.name}</h2>

                  <p>
                    {salesOrder.description ||
                      "No description"}
                  </p>
                </div>

                <div className="sales-order-card-side">
                  <span>
                    {salesOrder.status}
                  </span>

                  <div className="sales-order-actions">
                    <ActionMenu
                      ariaLabel={
                        `Open options for ${salesOrder.name}`
                      }
                      items={[
                        {
                          label: "Editar PV",
                          onClick: () => {
                            handleEditSalesOrder(
                              salesOrder.id,
                            );
                          },
                        },
                        {
                          label:
                            deletingSalesOrderId ===
                            salesOrder.id
                              ? "Removing..."
                              : "Deletar",
                          variant: "danger",
                          disabled:
                            deletingSalesOrderId ===
                            salesOrder.id,
                          onClick: () => {
                            void handleSoftDeleteSalesOrder(
                              salesOrder,
                            );
                          },
                        },
                      ]}
                    />
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
    </main>
  );
}

export default SalesOrdersPage;
