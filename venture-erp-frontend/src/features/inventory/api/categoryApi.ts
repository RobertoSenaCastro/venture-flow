import { apiFetch } from "../../../shared/api/httpClient";
import type {
  Category,
  CategoryRequest,
} from "../types/category";

function buildErrorMessage(
  response: Response,
  fallbackMessage: string,
): string {
  if (response.status === 409) {
    return (
      "This code is already in use by another category. " +
      "Choose a different code."
    );
  }

  return `${fallbackMessage} HTTP ${response.status}`;
}

export async function createCategory(
  categoryData: CategoryRequest,
): Promise<Category> {
  const response = await apiFetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8"
    },
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    throw new Error(
      buildErrorMessage(
        response,
        "Could not create the category.",
      ),
    );
  }

  return response.json() as Promise<Category>;
}

export async function getCategories(): Promise<
  Category[]
> {
  const response = await apiFetch("/api/categories", {method: "GET"});

  if (!response.ok) {
    throw new Error(
      `Could not load the categories. HTTP ${response.status}`,
    );
  }

  return response.json() as Promise<Category[]>;
}

export async function updateCategory(
  categoryId: number,
  categoryData: CategoryRequest,
): Promise<Category> {
  const response = await apiFetch(
    `/api/categories/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(categoryData),
    },
  );

  if (!response.ok) {
    throw new Error(
      buildErrorMessage(
        response,
        "Could not update the category.",
      ),
    );
  }

  return response.json() as Promise<Category>;
}

export async function softDeleteCategory(
  categoryId: number,
): Promise<void> {
  const response = await apiFetch(
    `/api/categories/${categoryId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not delete the category. HTTP ${response.status}`,
    );
  }
}
