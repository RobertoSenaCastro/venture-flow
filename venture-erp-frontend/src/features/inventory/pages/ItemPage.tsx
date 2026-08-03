import "../styles/ItemPage.css";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  changeItemQuantity,
  getItems,
  softDeleteItem,
} from "../api/itemApi";

import { getCategories } from "../api/categoryApi";

import QuantityAdjustmentForm from
  "../components/QuantityAdjustmentForm";

import type { Category } from "../types/category";

import {
  MEASUREMENT_UNIT_LABELS,
  type Item,
} from "../types/item";

function ItemsPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Item[]>([]);

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState<string>("");

  const [searchTerm, setSearchTerm] =
    useState<string>("");

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const [openMenuItemId, setOpenMenuItemId] =
    useState<number | null>(null);

  const [deletingItemId, setDeletingItemId] =
    useState<number | null>(null);

  const [deleteErrorMessage, setDeleteErrorMessage] =
    useState<string>("");

  const [adjustingItem, setAdjustingItem] =
    useState<Item | null>(null);

  const [adjustmentQuantity, setAdjustmentQuantity] =
    useState<string>("");

  const [adjustmentReason, setAdjustmentReason] =
    useState<string>("");

  const [
    isSubmittingAdjustment,
    setIsSubmittingAdjustment,
  ] = useState<boolean>(false);

  const [
    adjustmentErrorMessage,
    setAdjustmentErrorMessage,
  ] = useState<string>("");

  useEffect(() => {
    let isCancelled = false;

    async function loadPageData(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      const parsedCategoryId = Number(
        selectedCategoryId,
      );

      const categoryFilter = selectedCategoryId
        ? [parsedCategoryId]
        : undefined;

      try {
        /*
         * The page needs the items and the category filter options.
         * Loading both together avoids waiting for one request to
         * finish before starting the other.
         */
        const [loadedItems, loadedCategories] =
          await Promise.all([
            getItems(categoryFilter),
            getCategories(),
          ]);

        /*
         * The component may be unmounted, or the filter may change,
         * before the requests finish. In that case the result should
         * not update the state.
         */
        if (isCancelled) {
          return;
        }

        setItems(loadedItems);
        setCategories(loadedCategories);
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        if (error instanceof Error) {
          setLoadErrorMessage(error.message);
        } else {
          setLoadErrorMessage(
            "An unexpected error occurred while loading the items.",
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
  }, [selectedCategoryId]);

  /*
   * The search runs in the browser over the loaded list. The backend
   * has no search endpoint and no pagination yet.
   */
  const visibleItems = useMemo(() => {
    const normalizedSearchTerm = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearchTerm) {
      return items;
    }

    return items.filter((item) => {
      const matchesCode = item.code
        .toLowerCase()
        .includes(normalizedSearchTerm);

      const matchesName = item.name
        .toLowerCase()
        .includes(normalizedSearchTerm);

      const matchesAlias = item.aliases.some(
        (alias) =>
          alias.code
            .toLowerCase()
            .includes(normalizedSearchTerm),
      );

      return (
        matchesCode || matchesName || matchesAlias
      );
    });
  }, [items, searchTerm]);

  function toggleItemMenu(itemId: number): void {
    setOpenMenuItemId((currentOpenMenuId) => {
      if (currentOpenMenuId === itemId) {
        return null;
      }

      return itemId;
    });
  }

  function handleCreateItem(): void {
    navigate("/items/new");
  }

  function handleEditItem(itemId: number): void {
    setOpenMenuItemId(null);

    navigate(`/items/${itemId}/edit`);
  }

  function openQuantityForm(item: Item): void {
    setOpenMenuItemId(null);
    setAdjustingItem(item);
    setAdjustmentQuantity(String(item.quantity));
    setAdjustmentReason("");
    setAdjustmentErrorMessage("");
  }

  function closeQuantityForm(): void {
    setAdjustingItem(null);
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setAdjustmentErrorMessage("");
  }

  async function handleSubmitQuantity(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!adjustingItem) {
      return;
    }

    const parsedQuantity = Number(
      adjustmentQuantity,
    );

    const trimmedReason = adjustmentReason.trim();

    if (
      adjustmentQuantity === "" ||
      Number.isNaN(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setAdjustmentErrorMessage(
        "The quantity must be zero or a positive number.",
      );

      return;
    }

    if (!trimmedReason) {
      setAdjustmentErrorMessage(
        "The reason is required.",
      );

      return;
    }

    try {
      setIsSubmittingAdjustment(true);
      setAdjustmentErrorMessage("");

      const updatedItem =
        await changeItemQuantity(
          adjustingItem.id,
          {
            quantity: parsedQuantity,
            reason: trimmedReason,
          },
        );

      // Replace only the affected item instead of reloading the list.
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === updatedItem.id
            ? updatedItem
            : currentItem,
        ),
      );

      closeQuantityForm();
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAdjustmentErrorMessage(error.message);
      } else {
        setAdjustmentErrorMessage(
          "An unexpected error occurred while updating the quantity.",
        );
      }
    } finally {
      setIsSubmittingAdjustment(false);
    }
  }

  async function handleSoftDeleteItem(
    item: Item,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Do you want to remove ${item.code} — ${item.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingItemId(item.id);
    setDeleteErrorMessage("");
    setOpenMenuItemId(null);

    try {
      await softDeleteItem(item.id);

      // Remove the deleted item from the current list without
      // requesting the complete list from the backend again.
      setItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            currentItem.id !== item.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setDeleteErrorMessage(error.message);
      } else {
        setDeleteErrorMessage(
          "An unexpected error occurred while removing the item.",
        );
      }
    } finally {
      setDeletingItemId(null);
    }
  }

  return (
    <main className="page">
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Inventory</p>

          <h1>Items</h1>

          <p className="page-description">
            Register items, classify them by
            category, and keep the stock balance up
            to date.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to="/categories"
            className="secondary-button"
          >
            Categories
          </Link>

          <Link
            to="/items/trash"
            className="secondary-button trash-link"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>

            Trash
          </Link>

          <button
            type="button"
            className="primary-button"
            onClick={handleCreateItem}
          >
            New item
          </button>
        </div>
      </header>

      <section className="item-filters">
        <div className="item-filter-field">
          <label htmlFor="search">Search</label>

          <input
            id="search"
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            placeholder="Code, name, or alternative code"
          />
        </div>

        <div className="item-filter-field">
          <label htmlFor="categoryFilter">
            Category
          </label>

          <select
            id="categoryFilter"
            value={selectedCategoryId}
            onChange={(event) => {
              setSelectedCategoryId(
                event.target.value,
              );
            }}
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading && (
        <section className="details-card">
          Loading items...
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
        visibleItems.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">▤</div>

            <h2>No items found</h2>

            <p>
              Click <strong>New item</strong> to
              register one.
            </p>
          </section>
        )}

      {!isLoading &&
        !loadErrorMessage &&
        visibleItems.length > 0 && (
          <section className="item-list">
            {visibleItems.map((item) => (
              <article
                className="item-card"
                key={item.id}
              >
                <div className="item-card-main">
                  <strong>{item.code}</strong>

                  <h2>{item.name}</h2>

                  <p>
                    {item.description ||
                      "No description"}
                  </p>

                  <div className="item-card-tags">
                    {item.categories.map(
                      (category) => (
                        <span
                          key={category.id}
                          className="item-tag"
                        >
                          {category.name}
                        </span>
                      ),
                    )}

                    {item.aliases.length > 0 && (
                      <span className="item-tag item-tag-muted">
                        {item.aliases.length}{" "}
                        alternative code
                        {item.aliases.length > 1
                          ? "s"
                          : ""}
                      </span>
                    )}
                  </div>
                </div>

                <div className="item-card-side">
                  <div className="item-quantity">
                    <strong>{item.quantity}</strong>

                    <span>
                      {
                        MEASUREMENT_UNIT_LABELS[
                          item.unit
                        ]
                      }
                    </span>
                  </div>

                  <div className="item-actions">
                    <button
                      type="button"
                      className="item-menu-button"
                      onClick={() => {
                        toggleItemMenu(item.id);
                      }}
                      aria-label={
                        `Open options for ${item.name}`
                      }
                      aria-expanded={
                        openMenuItemId === item.id
                      }
                    >
                      ⋮
                    </button>

                    {openMenuItemId === item.id && (
                      <div className="item-menu">
                        <button
                          type="button"
                          className="item-menu-item"
                          onClick={() => {
                            handleEditItem(item.id);
                          }}
                        >
                          Edit item
                        </button>

                        <button
                          type="button"
                          className="item-menu-item"
                          onClick={() => {
                            openQuantityForm(item);
                          }}
                        >
                          Adjust quantity
                        </button>

                        <button
                          type="button"
                          className={
                            "item-menu-item " +
                            "item-menu-item-danger"
                          }
                          onClick={() => {
                            void handleSoftDeleteItem(
                              item,
                            );
                          }}
                          disabled={
                            deletingItemId ===
                            item.id
                          }
                        >
                          {deletingItemId === item.id
                            ? "Removing..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

      <QuantityAdjustmentForm
        item={adjustingItem}
        quantity={adjustmentQuantity}
        reason={adjustmentReason}
        isSubmitting={isSubmittingAdjustment}
        errorMessage={adjustmentErrorMessage}
        onQuantityChange={setAdjustmentQuantity}
        onReasonChange={setAdjustmentReason}
        onClose={closeQuantityForm}
        onSubmit={(event) => {
          void handleSubmitQuantity(event);
        }}
      />
    </main>
  );
}

export default ItemsPage;
