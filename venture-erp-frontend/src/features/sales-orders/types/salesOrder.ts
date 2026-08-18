export type SalesOrderStatus =
  | "CREATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface CreateSalesOrderRequest {
  name: string;
  description: string;
  status: SalesOrderStatus;
  resellerId: number;
}

export interface SalesOrder {
  id: number;
  code: string;
  name: string;
  description: string;
  status: SalesOrderStatus;
  active: boolean;
  createdAt: string;
  resellerId: number;
  resellerName: string;
  assemblySupervisorId: number | null;
  assemblySupervisorName: string | null;
}

export interface SalesOrderFormData {
  name: string;
  description: string;
}

export interface UpdateSalesOrderRequest {
  name: string;
  description: string;
  status: SalesOrderStatus;
  resellerId: number;
}
