# Inventory routes

Add the imports and routes below to `src/App.tsx`.

```tsx
import ItemsPage from "./features/inventory/pages/ItemPage";
import CreateItemPage from "./features/inventory/pages/CreateItemPage";
import EditItemPage from "./features/inventory/pages/EditItemPage";
import TrashItemPage from "./features/inventory/pages/TrashItemPage";
import CategoryPage from "./features/inventory/pages/CategoryPage";
```

```tsx
<Route path="/items" element={<ItemsPage />} />
<Route path="/items/new" element={<CreateItemPage />} />
<Route path="/items/:itemId/edit" element={<EditItemPage />} />
<Route path="/items/trash" element={<TrashItemPage />} />
<Route path="/categories" element={<CategoryPage />} />
```

Keep the catch-all redirect to `/` as the last route.

The sidebar in `src/app/layout` should link to `/items`.

Note: unlike the sales order feature, which mixes `/orders` and
`/sales-orders`, every inventory route is prefixed with `/items`.
