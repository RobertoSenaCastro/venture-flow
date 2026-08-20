import type { UserRole } from "../../auth/types/auth";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  resellerId: number | null;
  resellerName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  name: string;
  email: string;
  role: UserRole;
  resellerId?: number | null;
}

export interface UserCreationRequest {
  user: UserRequest;
  password: string;
}

export interface PasswordChangeRequest {
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole | "";
  resellerId: string;
  password: string;
}

export interface UserFilters {
  role?: UserRole;
  resellerId?: number;
}
