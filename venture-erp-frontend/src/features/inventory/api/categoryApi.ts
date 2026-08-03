import type {
  Category,
  CategoryRequest,
} from "../types/category";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/$/, "");

const CATEGORIES_API_URL =
  `${API_BASE_URL}/api/categories`;

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
  const response = await fetch(CATEGORIES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json",
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
  const response = await fetch(CATEGORIES_API_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

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
  const response = await fetch(
    `${CATEGORIES_API_URL}/${categoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json",
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
  const response = await fetch(
    `${CATEGORIES_API_URL}/${categoryId}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not delete the category. HTTP ${response.status}`,
    );
  }
}
