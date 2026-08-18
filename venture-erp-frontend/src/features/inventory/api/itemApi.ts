import { apiFetch } from "../../../shared/api/httpClient";
import type {
  Item,
  ItemRequest,
  QuantityAdjustmentRequest,
} from "../types/item";

/**
 * The backend answers 409 when an internal code or an alias is already
 * taken. That is a correctable user mistake, so it deserves a clearer
 * message than the raw status code.
 */
function buildErrorMessage(
  response: Response,
  fallbackMessage: string,
): string {
  if (response.status === 409) {
    return (
      "This code is already in use by another item. " +
      "Choose a different code."
    );
  }

  return `${fallbackMessage} HTTP ${response.status}`;
}

export async function createItem(
  itemData: ItemRequest,
): Promise<Item> {
  const response = await apiFetch("/api/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(itemData),
  });

  if (!response.ok) {
    throw new Error(
      buildErrorMessage(
        response,
        "Could not create the item.",
      ),
    );
  }

  return response.json() as Promise<Item>;
}

export async function getItems(
  categoryIds?: number[],
): Promise<Item[]> {
  const query =
    categoryIds && categoryIds.length > 0
      ? `?categoryIds=${categoryIds.join(",")}`
      : "";

  const response = await apiFetch(
    `/api/items${query}`,{method: "GET"},
  );

  if (!response.ok) {
    throw new Error(
      `Could not load the items. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Item[]>;
}

export async function getItemById(
  itemId: number,
): Promise<Item> {
  const response = await apiFetch(
    `/api/items/${itemId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not load the item. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Item>;
}

export async function updateItem(
  itemId: number,
  itemData: ItemRequest,
): Promise<Item> {
  const response = await apiFetch(
    `/api/items/${itemId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify(itemData),
    },
  );

  if (!response.ok) {
    throw new Error(
      buildErrorMessage(
        response,
        "Could not update the item.",
      ),
    );
  }

  return response.json() as Promise<Item>;
}

/** The only call that writes the stock balance. */
export async function changeItemQuantity(
  itemId: number,
  adjustment: QuantityAdjustmentRequest,
): Promise<Item> {
  const response = await apiFetch(
    `/api/items/${itemId}/quantity`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify(adjustment),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not update the quantity. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Item>;
}

export async function softDeleteItem(
  itemId: number,
): Promise<void> {
  const response = await apiFetch(
    `/api/items/${itemId}`,
    {method: "DELETE"},
  );

  if (!response.ok) {
    throw new Error(
      `Could not delete the item. HTTP ${response.status}`,
    );
  }
}

export async function getSoftDeletedItems(): Promise<
  Item[]
> {
  const response = await apiFetch(
    "/api/items/trash",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not load deleted items. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Item[]>;
}

export async function restoreItem(
  itemId: number,
): Promise<void> {
  const response = await apiFetch(
    `/api/items/${itemId}/activate`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not restore the item. HTTP ${response.status}`,
    );
  }
}
