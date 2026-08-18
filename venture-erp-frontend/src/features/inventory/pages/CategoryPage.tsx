import "../../../styles/modal.css";
import "../styles/ItemPage.css";
import "../styles/CategoryPage.css";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import BackButton from
  "../../../shared/components/BackButton";

import {
  createCategory,
  getCategories,
  softDeleteCategory,
  updateCategory,
} from "../api/categoryApi";

import {
  INITIAL_CATEGORY_FORM_DATA,
  type Category,
  type CategoryFormData,
} from "../types/category";

/**
 * Categories classify items. They do not control what a reseller can
 * see or request: that is a separate catalog/permission concept.
 */
function CategoryPage() {
  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const [isFormOpen, setIsFormOpen] =
    useState<boolean>(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [formData, setFormData] =
    useState<CategoryFormData>(
      INITIAL_CATEGORY_FORM_DATA,
    );

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [
    submitErrorMessage,
    setSubmitErrorMessage,
  ] = useState<string>("");

  const [deletingCategoryId, setDeletingCategoryId] =
    useState<number | null>(null);

  const [deleteErrorMessage, setDeleteErrorMessage] =
    useState<string>("");

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      try {
        const loadedCategories =
          await getCategories();

        setCategories(loadedCategories);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setLoadErrorMessage(error.message);
        } else {
          setLoadErrorMessage(
            "An unexpected error occurred while loading the categories.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadCategories();
  }, []);

  function openCreateForm(): void {
    setEditingCategory(null);
    setFormData(INITIAL_CATEGORY_FORM_DATA);
    setSubmitErrorMessage("");
    setIsFormOpen(true);
  }

  function openEditForm(category: Category): void {
    setEditingCategory(category);

    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || "",
    });

    setSubmitErrorMessage("");
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setEditingCategory(null);
    setFormData(INITIAL_CATEGORY_FORM_DATA);
    setSubmitErrorMessage("");
  }

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ): void {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const trimmedCode = formData.code.trim();
    const trimmedName = formData.name.trim();

    const trimmedDescription =
      formData.description.trim();

    if (!trimmedCode || !trimmedName) {
      setSubmitErrorMessage(
        "Code and name are required.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");

      const requestData = {
        code: trimmedCode,
        name: trimmedName,
        description: trimmedDescription,
      };

      if (editingCategory) {
        const updatedCategory =
          await updateCategory(
            editingCategory.id,
            requestData,
          );

        setCategories((currentCategories) =>
          currentCategories.map((category) =>
            category.id === updatedCategory.id
              ? updatedCategory
              : category,
          ),
        );
      } else {
        const createdCategory =
          await createCategory(requestData);

        setCategories((currentCategories) => [
          ...currentCategories,
          createdCategory,
        ]);
      }

      closeForm();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitErrorMessage(error.message);
      } else {
        setSubmitErrorMessage(
          "An unexpected error occurred while saving the category.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSoftDeleteCategory(
    category: Category,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Do you want to remove the category ${category.name}? ` +
        "Items already classified with it keep the association, " +
        "but the category can no longer be assigned.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingCategoryId(category.id);
    setDeleteErrorMessage("");

    try {
      await softDeleteCategory(category.id);

      setCategories((currentCategories) =>
        currentCategories.filter(
          (currentCategory) =>
            currentCategory.id !== category.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setDeleteErrorMessage(error.message);
      } else {
        setDeleteErrorMessage(
          "An unexpected error occurred while removing the category.",
        );
      }
    } finally {
      setDeletingCategoryId(null);
    }
  }

  return (
    <main className="page">
      <BackButton to="/items" label="Estoque" />

      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Inventory</p>

          <h1>Categories</h1>

          <p className="page-description">
            Classify items by material or purpose.
            Every item needs at least one category.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="primary-button"
            onClick={openCreateForm}
          >
            New category
          </button>
        </div>
      </header>

      {isLoading && (
        <section className="details-card">
          Loading categories...
        </section>
      )}

      {loadErrorMessage && (
        <section
          className="error-message"
          role="alert"
        >
          {loadErrorMessage}
        </section>
      )}

      {deleteErrorMessage && (
        <section
          className="error-message"
          role="alert"
        >
          {deleteErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        categories.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">◧</div>

            <h2>No categories found</h2>

            <p>
              Click <strong>New category</strong> to
              register one.
            </p>
          </section>
        )}

      {!isLoading &&
        !loadErrorMessage &&
        categories.length > 0 && (
          <section className="item-list">
            {categories.map((category) => (
              <article
                className="item-card"
                key={category.id}
              >
                <div className="item-card-main">
                  <strong>{category.code}</strong>

                  <h2>{category.name}</h2>

                  <p>
                    {category.description ||
                      "No description"}
                  </p>
                </div>

                <div className="category-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      openEditForm(category);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="category-delete-button"
                    disabled={
                      deletingCategoryId ===
                      category.id
                    }
                    onClick={() => {
                      void handleSoftDeleteCategory(
                        category,
                      );
                    }}
                  >
                    {deletingCategoryId ===
                    category.id
                      ? "Removing..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

      {isFormOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
          >
            <div className="modal-header">
              <h2 id="category-form-title">
                {editingCategory
                  ? "Edit category"
                  : "New category"}
              </h2>

              <button
                type="button"
                className="modal-close-button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Close category form"
              >
                ×
              </button>
            </div>

            <form
              className="category-form"
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
            >
              <label htmlFor="categoryCode">
                Code

                <input
                  id="categoryCode"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleInputChange}
                  maxLength={30}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label htmlFor="categoryName">
                Name

                <input
                  id="categoryName"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={150}
                  disabled={isSubmitting}
                  required
                />
              </label>

              <label htmlFor="categoryDescription">
                Description

                <textarea
                  id="categoryDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={500}
                  disabled={isSubmitting}
                />
              </label>

              {submitErrorMessage && (
                <div
                  className="error-message"
                  role="alert"
                >
                  {submitErrorMessage}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    isSubmitting ||
                    !formData.code.trim() ||
                    !formData.name.trim()
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default CategoryPage;
