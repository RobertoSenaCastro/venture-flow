import "../styles/ItemFormPage.css";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getItemById,
  updateItem,
} from "../api/itemApi";

import { getCategories } from "../api/categoryApi";

import ItemFormFields from
  "../components/ItemFormFields";

import type { Category } from "../types/category";

import {
  INITIAL_ITEM_FORM_DATA,
  MEASUREMENT_UNIT_LABELS,
  type Item,
  type ItemFormData,
} from "../types/item";

function EditItemPage() {
  const navigate = useNavigate();

  const { itemId } = useParams<{
    itemId: string;
  }>();

  const [item, setItem] = useState<Item | null>(
    null,
  );

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [formData, setFormData] =
    useState<ItemFormData>(
      INITIAL_ITEM_FORM_DATA,
    );

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    useState<string>("");

  const [
    submitErrorMessage,
    setSubmitErrorMessage,
  ] = useState<string>("");

  const [successMessage, setSuccessMessage] =
    useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function loadPageData(): Promise<void> {
      const parsedItemId = Number(itemId);

      if (
        !itemId ||
        Number.isNaN(parsedItemId)
      ) {
        setErrorMessage("Invalid item ID.");
        setIsLoading(false);

        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        /*
         * The form needs the item and the category options.
         * Loading both requests together avoids waiting for one
         * request to finish before starting the other.
         */
        const [loadedItem, loadedCategories] =
          await Promise.all([
            getItemById(parsedItemId),
            getCategories(),
          ]);

        /*
         * The component may be unmounted before the requests finish.
         * In that case, the result should not update its state.
         */
        if (isCancelled) {
          return;
        }

        setItem(loadedItem);
        setCategories(loadedCategories);
        setFormData(toFormData(loadedItem));
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            "An unexpected error occurred while loading the item.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPageData();

    return () => {
      isCancelled = true;
    };
  }, [itemId]);

  function toFormData(
    loadedItem: Item,
  ): ItemFormData {
    return {
      code: loadedItem.code,
      name: loadedItem.name,
      description: loadedItem.description || "",
      unit: loadedItem.unit,

      categoryIds: loadedItem.categories.map(
        (category) => category.id,
      ),

      aliases: loadedItem.aliases.map((alias) => ({
        code: alias.code,
        source: alias.source,
      })),
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const parsedItemId = Number(itemId);

    const trimmedCode = formData.code.trim();
    const trimmedName = formData.name.trim();

    const trimmedDescription =
      formData.description.trim();

    if (!itemId || Number.isNaN(parsedItemId)) {
      setSubmitErrorMessage("Invalid item ID.");

      return;
    }

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
      setSuccessMessage("");

      const updatedItem = await updateItem(
        parsedItemId,
        {
          code: trimmedCode,
          name: trimmedName,
          description: trimmedDescription,
          unit: formData.unit,
          categoryIds: formData.categoryIds,
          aliases: filledAliases,
        },
      );

      setItem(updatedItem);
      setFormData(toFormData(updatedItem));

      setSuccessMessage(
        "Item updated successfully.",
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSubmitErrorMessage(error.message);
      } else {
        setSubmitErrorMessage(
          "An unexpected error occurred while updating the item.",
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

        <h1>Edit item</h1>

        <p className="page-description">
          Update the catalog information. The stock
          balance is adjusted from the item list.
        </p>
      </header>

      {isLoading && (
        <section className="item-form-card">
          Loading item...
        </section>
      )}

      {errorMessage && (
        <section
          className="item-form-message item-form-error"
          role="alert"
        >
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && item && (
        <form
          className="item-form-card item-form"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="item-form-summary">
            <div>
              <span>Current quantity</span>

              <strong>
                {item.quantity}{" "}
                {
                  MEASUREMENT_UNIT_LABELS[
                    item.unit
                  ]
                }
              </strong>
            </div>

            <div>
              <span>Status</span>

              <strong>
                {item.active
                  ? "Active"
                  : "In the trash"}
              </strong>
            </div>
          </div>

          <ItemFormFields
            formData={formData}
            categories={categories}
            isCategoryListLoading={false}
            isSubmitting={isSubmitting}
            onChange={setFormData}
          />

          {submitErrorMessage && (
            <div
              className="item-form-message item-form-error"
              role="alert"
            >
              {submitErrorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="item-form-message item-form-success"
              role="status"
            >
              {successMessage}
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
                !formData.code.trim() ||
                !formData.name.trim() ||
                formData.categoryIds.length === 0
              }
            >
              {isSubmitting
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

export default EditItemPage;
