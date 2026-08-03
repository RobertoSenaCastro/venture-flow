import type { ResellerOption } from "../types/reseller";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/$/, "");

const RESELLERS_API_URL =
  `${API_BASE_URL}/api/resellers`;

export async function getActiveResellers():
Promise<ResellerOption[]> {
  const response = await fetch(RESELLERS_API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Could not load resellers. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<ResellerOption[]>;
}