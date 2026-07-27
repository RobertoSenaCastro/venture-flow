import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getSoftDeletedSalesOrders,
  restoreSalesOrder,
} from "../api/salesOrderApi";

import type { SalesOrder } from "../types/salesOrder";

import "./SalesOrderPage.css";

function SalesOrderTrashPage() {
  const [deletedSalesOrders, setDeletedSalesOrders] =
    useState<SalesOrder[]>([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const [restoringSalesOrderId, setRestoringSalesOrderId] =
    useState<number | null>(null);

  const [restoreErrorMessage, setRestoreErrorMessage] =
    useState<string>("");

  useEffect(() => {
    async function loadDeletedSalesOrders(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      try {
        const loadedSalesOrders =
          await getSoftDeletedSalesOrders();

        setDeletedSalesOrders(loadedSalesOrders);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setLoadErrorMessage(error.message);
        } else {
          setLoadErrorMessage(
            "An unexpected error occurred while loading the trash.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadDeletedSalesOrders();
  }, []);

  async function handleRestoreSalesOrder(
    salesOrder: SalesOrder,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Do you want to restore ${salesOrder.code} — ${salesOrder.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setRestoringSalesOrderId(salesOrder.id);
    setRestoreErrorMessage("");

    try {
      await restoreSalesOrder(salesOrder.id);

      setDeletedSalesOrders((currentSalesOrders) =>
        currentSalesOrders.filter(
          (currentSalesOrder) =>
            currentSalesOrder.id !== salesOrder.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setRestoreErrorMessage(error.message);
      } else {
        setRestoreErrorMessage(
          "An unexpected error occurred while restoring the sales order.",
        );
      }
    } finally {
      setRestoringSalesOrderId(null);
    }
  }

  return (
    <main className="page">
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Sales orders</p>

          <h1>Trash</h1>

          <p className="page-description">
            View and restore deleted sales orders.
          </p>
        </div>

        <Link
          to="/sales-orders"
          className="secondary-button"
        >
          Back to sales orders
        </Link>
      </header>

      {isLoading && (
        <section className="details-card">
          Loading deleted sales orders...
        </section>
      )}

      {loadErrorMessage && (
        <section className="error-message" role="alert">
          {loadErrorMessage}
        </section>
      )}

      {restoreErrorMessage && (
        <section className="error-message" role="alert">
          {restoreErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        deletedSalesOrders.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">♲</div>

            <h2>The trash is empty</h2>

            <p>
              Deleted sales orders will appear here.
            </p>
          </section>
        )}

      {!isLoading &&
        !loadErrorMessage &&
        deletedSalesOrders.length > 0 && (
          <section className="sales-orders-list">
            {deletedSalesOrders.map((salesOrder) => (
              <article
                className="sales-order-card"
                key={salesOrder.id}
              >
                <div>
                  <strong>{salesOrder.code}</strong>

                  <h2>{salesOrder.name}</h2>

                  <p>
                    {salesOrder.description ||
                      "No description"}
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    restoringSalesOrderId ===
                    salesOrder.id
                  }
                  onClick={() => {
                    void handleRestoreSalesOrder(
                      salesOrder,
                    );
                  }}
                >
                  {restoringSalesOrderId === salesOrder.id
                    ? "Restoring..."
                    : "Restore"}
                </button>
              </article>
            ))}
          </section>
        )}
    </main>
  );
}

export default SalesOrderTrashPage;