import type { ResellerOption } from "../types/reseller";
import { apiFetch } from "../../../shared/api/httpClient";
import type {
  Reseller,
  ResellerRequest,
} from "../types/resellerAdmin";

async function buildErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  if (response.status === 409) {
    return "Documento já cadastrado";
  }

  if (response.status === 422) {
    try {
      const errorBody = (await response.json()) as {
        message?: string;
        error?: string;
      };

      return errorBody.message || errorBody.error || "Dados inválidos";
    } catch {
      return "Dados inválidos";
    }
  }

  return `${fallbackMessage} HTTP ${response.status}`;
}

export async function getActiveResellers(): Promise<ResellerOption[]> {
  const response = await apiFetch("/api/resellers", { method: "GET" });

  if (!response.ok) {
    throw new Error(`Could not load resellers. HTTP ${response.status}`);
  }

  return response.json() as Promise<ResellerOption[]>;
}

export async function getResellersDetails(): Promise<Reseller[]> {
  const response = await apiFetch("/api/resellers/details", { method: "GET" });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar as revendas. HTTP ${response.status}`);
  }

  return response.json() as Promise<Reseller[]>;
}

export async function getResellerById(resellerId: number): Promise<Reseller> {
  const response = await apiFetch(`/api/resellers/${resellerId}`, { method: "GET" });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar a revenda. HTTP ${response.status}`);
  }

  return response.json() as Promise<Reseller>;
}

export async function createReseller(data: ResellerRequest): Promise<Reseller> {
  const response = await apiFetch("/api/resellers", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response, "Não foi possível criar a revenda."));
  }

  return response.json() as Promise<Reseller>;
}

export async function updateReseller(
  resellerId: number,
  data: ResellerRequest,
): Promise<Reseller> {
  const response = await apiFetch(`/api/resellers/${resellerId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await buildErrorMessage(response, "Não foi possível atualizar a revenda."));
  }

  return response.json() as Promise<Reseller>;
}

export async function softDeleteReseller(resellerId: number): Promise<void> {
  const response = await apiFetch(`/api/resellers/${resellerId}`, { method: "DELETE" });

  if (!response.ok) {
    throw new Error(`Não foi possível desativar a revenda. HTTP ${response.status}`);
  }
}

export async function getResellersTrash(): Promise<Reseller[]> {
  const response = await apiFetch("/api/resellers/trash", { method: "GET" });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar a lixeira. HTTP ${response.status}`);
  }

  return response.json() as Promise<Reseller[]>;
}

export async function restoreReseller(resellerId: number): Promise<void> {
  const response = await apiFetch(`/api/resellers/${resellerId}/activate`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Não foi possível restaurar a revenda. HTTP ${response.status}`);
  }
}
