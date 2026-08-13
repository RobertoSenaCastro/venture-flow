import type { ResellerOption } from "../types/reseller";
import { apiFetch } from "../../../shared/api/httpClient";

export async function getActiveResellers(): Promise<ResellerOption[]> {
  const response = await apiFetch("/api/resellers", { method: "GET" });

  if (!response.ok) {
    throw new Error(`Could not load resellers. HTTP ${response.status}`);
  }

  return response.json() as Promise<ResellerOption[]>;
}