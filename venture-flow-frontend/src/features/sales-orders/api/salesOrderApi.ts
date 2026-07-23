import type {
  CreateSalesOrderRequest,
  SalesOrder,
} from "../types/salesOrder";

const SALES_ORDERS_API_URL = "/api/sales-orders";

export async function createSalesOrder(
  salesOrderData: CreateSalesOrderRequest,
): Promise<SalesOrder> {
  const response = await fetch(SALES_ORDERS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify(salesOrderData),
  });

  if (!response.ok) {
    throw new Error(
      `Could not create the sales order. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder>;
}

export async function getSalesOrders(): Promise<SalesOrder[]> {
  const response = await fetch(SALES_ORDERS_API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Could not load the sales orders. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder[]>;
}

export async function getSalesOrderById(
  salesOrderId: number,
): Promise<SalesOrder> {
  const response = await fetch(
    `${SALES_ORDERS_API_URL}/${salesOrderId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not load the sales order. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder>;
}

export async function updateSalesOrder(
  salesOrderId: number,
  salesOrderData: UpdateSalesOrderRequest,
): Promise<SalesOrder> {
  const response = await fetch(
    `${SALES_ORDERS_API_URL}/${salesOrderId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify(salesOrderData),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not update the sales order. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder>;
}