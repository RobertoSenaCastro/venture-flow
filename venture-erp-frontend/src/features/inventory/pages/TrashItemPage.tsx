import "../styles/ItemPage.css";

import { useEffect, useState } from "react";

import BackButton from
  "../../../shared/components/BackButton";

import {
  getSoftDeletedItems,
  restoreItem,
} from "../api/itemApi";

import {
  MEASUREMENT_UNIT_LABELS,
  type Item,
} from "../types/item";

function TrashItemPage() {
  const [deletedItems, setDeletedItems] = useState<
    Item[]
  >([]);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [loadErrorMessage, setLoadErrorMessage] =
    useState<string>("");

  const [restoringItemId, setRestoringItemId] =
    useState<number | null>(null);

  const [
    restoreErrorMessage,
    setRestoreErrorMessage,
  ] = useState<string>("");

  useEffect(() => {
    async function loadDeletedItems(): Promise<void> {
      setIsLoading(true);
      setLoadErrorMessage("");

      try {
        const loadedItems =
          await getSoftDeletedItems();

        setDeletedItems(loadedItems);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setLoadErrorMessage(error.message);
        } else {
          setLoadErrorMessage(
            "An unexpected error occurred while loading the trash.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadDeletedItems();
  }, []);

  async function handleRestoreItem(
    item: Item,
  ): Promise<void> {
    const confirmed = window.confirm(
      `Do you want to restore ${item.code} — ${item.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setRestoringItemId(item.id);
    setRestoreErrorMessage("");

    try {
      await restoreItem(item.id);

      setDeletedItems((currentItems) =>
        currentItems.filter(
          (currentItem) =>
            currentItem.id !== item.id,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        setRestoreErrorMessage(error.message);
      } else {
        setRestoreErrorMessage(
          "An unexpected error occurred while restoring the item.",
        );
      }
    } finally {
      setRestoringItemId(null);
    }
  }

  return (
    <main className="page">
      <BackButton to="/items" label="Estoque" />

      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Inventory</p>

          <h1>Trash</h1>

          <p className="page-description">
            View and restore deleted items. The
            stock balance is preserved.
          </p>
        </div>

      </header>

      {isLoading && (
        <section className="details-card">
          Loading deleted items...
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

      {restoreErrorMessage && (
        <section
          className="error-message"
          role="alert"
        >
          {restoreErrorMessage}
        </section>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        deletedItems.length === 0 && (
          <section className="empty-state">
            <div className="empty-state-icon">♲</div>

            <h2>The trash is empty</h2>

            <p>
              Deleted items will appear here.
            </p>
          </section>
        )}

      {!isLoading &&
        !loadErrorMessage &&
        deletedItems.length > 0 && (
          <section className="item-list">
            {deletedItems.map((item) => (
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

                  <button
                    type="button"
                    className="secondary-button"
                    disabled={
                      restoringItemId === item.id
                    }
                    onClick={() => {
                      void handleRestoreItem(item);
                    }}
                  >
                    {restoringItemId === item.id
                      ? "Restoring..."
                      : "Restore"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
    </main>
  );
}

export default TrashItemPage;
