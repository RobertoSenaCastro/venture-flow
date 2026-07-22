import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSalesOrderById } from "../api/salesOrderApi";

import type { SalesOrder } from "../types/salesOrder";

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
        <section className="details-card">
          <h2>{salesOrder.code}</h2>

          <p>
            <strong>Name:</strong> {salesOrder.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {salesOrder.description || "No description"}
          </p>

          <p>
            <strong>Status:</strong> {salesOrder.status}
          </p>
        </section>
      )}
    </main>
  );
}

export default SalesOrderEditPage;