import { apiFetch } from "../../../shared/api/httpClient";
import type {
  PasswordChangeRequest,
  User,
  UserCreationRequest,
  UserFilters,
  UserRequest,
} from "../types/user";

async function buildErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  if (response.status === 409) {
    return "E-mail já está em uso";
  }

  if (response.status === 422) {
    return "Combinação inválida de papel e revenda";
  }

  return `${fallbackMessage} HTTP ${response.status}`;
}

export async function getUsers(filters: UserFilters = {}): Promise<User[]> {
  const searchParams = new URLSearchParams();

  if (filters.role) {
    searchParams.set("role", filters.role);
  }

  if (filters.resellerId !== undefined) {
    searchParams.set("resellerId", String(filters.resellerId));
  }

  const query = searchParams.toString();
  const response = await apiFetch(`/api/users${query ? `?${query}` : ""}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível carregar os usuários."),
    );
  }

  return response.json() as Promise<User[]>;
}

export async function getUserTrash(): Promise<User[]> {
  const response = await apiFetch("/api/users/trash", { method: "GET" });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível carregar a lixeira de usuários."),
    );
  }

  return response.json() as Promise<User[]>;
}

export async function getUserById(userId: number): Promise<User> {
  const response = await apiFetch(`/api/users/${userId}`, { method: "GET" });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível carregar o usuário."),
    );
  }

  return response.json() as Promise<User>;
}

export async function createUser(body: UserCreationRequest): Promise<User> {
  const response = await apiFetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível criar o usuário."),
    );
  }

  return response.json() as Promise<User>;
}

export async function updateUser(
  userId: number,
  body: UserRequest,
): Promise<User> {
  const response = await apiFetch(`/api/users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível atualizar o usuário."),
    );
  }

  return response.json() as Promise<User>;
}

export async function changeUserPassword(
  userId: number,
  body: PasswordChangeRequest,
): Promise<void> {
  const response = await apiFetch(`/api/users/${userId}/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível alterar a senha do usuário."),
    );
  }
}

export async function deactivateUser(userId: number): Promise<void> {
  const response = await apiFetch(`/api/users/${userId}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível desativar o usuário."),
    );
  }
}

export async function activateUser(userId: number): Promise<void> {
  const response = await apiFetch(`/api/users/${userId}/activate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await buildErrorMessage(response, "Não foi possível restaurar o usuário."),
    );
  }
}
