import { apiFetch } from "../../../shared/api/httpClient";
import type {
  CreateSalesOrderRequest,
  SalesOrder,
  UpdateSalesOrderRequest,
} from "../types/salesOrder";

export interface AssemblySupervisorOption {
  id: number;
  name: string;
}

export interface SalesOrderWithAssemblySupervisor extends SalesOrder {
  assemblySupervisorId: number | null;
  assemblySupervisorName: string | null;
}

type UpdateSalesOrderWithAssemblySupervisorRequest =
  UpdateSalesOrderRequest & {
    assemblySupervisorId: number | null;
  };

export async function createSalesOrder(
  salesOrderData: CreateSalesOrderRequest,
): Promise<SalesOrder> {
  const response = await apiFetch("/api/sales-orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
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
  const response = await apiFetch("/api/sales-orders", {method: "GET",});

  if (!response.ok) {
    throw new Error(
      `Could not load the sales orders. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder[]>;
}

export async function getSalesOrderById(
  salesOrderId: number,
): Promise<SalesOrderWithAssemblySupervisor> {
  const response = await apiFetch(
    `/api/sales-orders/${salesOrderId}`,{method: "GET"},
  );

  if (!response.ok) {
    throw new Error(
      `Could not load the sales order. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrderWithAssemblySupervisor>;
}

export async function getAssemblySupervisorsByReseller(
  resellerId: number,
): Promise<AssemblySupervisorOption[]> {
  const response = await apiFetch(
    `/api/users/supervisors?resellerId=${encodeURIComponent(resellerId)}`,
    { method: "GET" },
  );

  if (!response.ok) {
    throw new Error(
      `Could not load assembly supervisors. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<AssemblySupervisorOption[]>;
}

export async function updateSalesOrder(
  salesOrderId: number,
  salesOrderData: UpdateSalesOrderWithAssemblySupervisorRequest,
): Promise<SalesOrderWithAssemblySupervisor> {
  const response = await apiFetch(
    `/api/sales-orders/${salesOrderId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(salesOrderData),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not update the sales order. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrderWithAssemblySupervisor>;
}

export async function softDeleteSalesOrder(
  salesOrderId: number,
): Promise<void> {
  const response = await apiFetch(
    `/api/sales-orders/${salesOrderId}`, {method: "DELETE",},
  );

  if (!response.ok) {
    throw new Error(
      `Could not delete the sales order. HTTP ${response.status}`,
    );
  }
}

export async function getSoftDeletedSalesOrders():
Promise<SalesOrder[]> {
  const response = await apiFetch(
    "/api/sales-orders/trash",{method: "GET",},
  );

  if (!response.ok) {
    throw new Error(
      `Could not load deleted sales orders. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<SalesOrder[]>;
}

export async function restoreSalesOrder(
  salesOrderId: number,
): Promise<void> {
  const response = await apiFetch(
    `/api/sales-orders/${salesOrderId}/activate`,
    {method: "PATCH",},
  );

  if (!response.ok) {
    throw new Error(
      `Could not restore the sales order. HTTP ${response.status}`,
    );
  }
}
