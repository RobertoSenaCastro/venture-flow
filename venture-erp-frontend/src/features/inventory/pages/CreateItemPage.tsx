import "../styles/ItemFormPage.css";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { useNavigate } from "react-router-dom";

import { createItem } from "../api/itemApi";
import { getCategories } from "../api/categoryApi";

import ItemFormFields from
  "../components/ItemFormFields";

import type { Category } from "../types/category";

import {
  INITIAL_ITEM_FORM_DATA,
  type ItemFormData,
} from "../types/item";

function CreateItemPage() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<ItemFormData>(
      INITIAL_ITEM_FORM_DATA,
    );

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [
    isLoadingCategories,
    setIsLoadingCategories,
  ] = useState<boolean>(true);

  const [
    categoryLoadErrorMessage,
    setCategoryLoadErrorMessage,
  ] = useState<string>("");

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [
    submitErrorMessage,
    setSubmitErrorMessage,
  ] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function loadCategories(): Promise<void> {
      try {
        setIsLoadingCategories(true);
        setCategoryLoadErrorMessage("");

        const loadedCategories =
          await getCategories();

        if (isCancelled) {
          return;
        }

        setCategories(loadedCategories);
      } catch {
        if (!isCancelled) {
          setCategoryLoadErrorMessage(
            "Could not load the categories.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    // Prevents the browser from reloading the page when the form is submitted.
    event.preventDefault();

    const trimmedCode = formData.code.trim();
    const trimmedName = formData.name.trim();

    const trimmedDescription =
      formData.description.trim();

    if (!trimmedCode) {
      setSubmitErrorMessage(
        "The item code is required.",
      );

      return;
    }

    if (!trimmedName) {
      setSubmitErrorMessage(
        "The item name is required.",
      );

      return;
    }

    if (formData.categoryIds.length === 0) {
      setSubmitErrorMessage(
        "At least one category must be selected.",
      );

      return;
    }

    /*
     * Empty alias rows are discarded instead of rejected: an operator
     * who adds a row and gives up should not be blocked by it.
     */
    const filledAliases = formData.aliases
      .map((alias) => ({
        code: alias.code.trim(),
        source: alias.source.trim(),
      }))
      .filter(
        (alias) => alias.code || alias.source,
      );

    const incompleteAlias = filledAliases.find(
      (alias) => !alias.code || !alias.source,
    );

    if (incompleteAlias) {
      setSubmitErrorMessage(
        "Every alternative code needs both a source and a code.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");

      await createItem({
        code: trimmedCode,
        name: trimmedName,
        description: trimmedDescription,
        unit: formData.unit,
        categoryIds: formData.categoryIds,
        aliases: filledAliases,
      });

      // Return to the list only after the backend confirms the creation.
      navigate("/items");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitErrorMessage(error.message);
      } else {
        setSubmitErrorMessage(
          "An unexpected error occurred while creating the item.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page item-form-page">
      <header className="item-form-header">
        <p className="eyebrow">Inventory</p>

        <h1>New item</h1>

        <p className="page-description">
          Enter the catalog information. The stock
          balance starts at zero and is adjusted
          from the item list.
        </p>
      </header>

      <section className="item-form-card">
        <form
          className="item-form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <ItemFormFields
            formData={formData}
            categories={categories}
            isCategoryListLoading={
              isLoadingCategories
            }
            isSubmitting={isSubmitting}
            onChange={setFormData}
          />

          {categoryLoadErrorMessage && (
            <div
              className="item-form-message item-form-error"
              role="alert"
            >
              {categoryLoadErrorMessage}
            </div>
          )}

          {submitErrorMessage && (
            <div
              className="item-form-message item-form-error"
              role="alert"
            >
              {submitErrorMessage}
            </div>
          )}

          <div className="item-form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                navigate("/items");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSubmitting ||
                isLoadingCategories ||
                !formData.code.trim() ||
                !formData.name.trim() ||
                formData.categoryIds.length === 0
              }
            >
              {isSubmitting
                ? "Creating..."
                : "Create item"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateItemPage;
