export type SalesOrderStatus =
  | "CREATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface CreateSalesOrderRequest {
  name: string;
  description: string;
  status: SalesOrderStatus;
}

export interface SalesOrder {
  id: number;
  code: string;
  name: string;
  description: string;
  status: SalesOrderStatus;
  active: boolean;
  createdAt: string;
}

export interface SalesOrderFormData {
  name: string;
  description: string;
}