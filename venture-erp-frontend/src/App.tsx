import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./app/layout/Sidebar";
import HomePage from "./features/home/pages/HomePage";
import OrdersPage from "./features/sales-orders/pages/SalesOrderPage";
import SalesOrderEditPage from "./features/sales-orders/pages/EditSalesOrderPage";
import SalesOrderTrashPage from "./features/sales-orders/pages/TrashSalesOrderPage";
import { CreateSalesOrderPage } from "./features/sales-orders/pages/CreateSalesOrderPage";

import ItemsPage from "./features/inventory/pages/ItemPage";
import CreateItemPage from "./features/inventory/pages/CreateItemPage";
import EditItemPage from "./features/inventory/pages/EditItemPage";
import TrashItemPage from "./features/inventory/pages/TrashItemPage";
import CategoryPage from "./features/inventory/pages/CategoryPage";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="sales-orders/new" element={<CreateSalesOrderPage />} />
          <Route path="/sales-orders" element={<OrdersPage />} />
          <Route path="/sales-orders/:salesOrderId/edit" element={<SalesOrderEditPage />} />
          <Route path="/sales-orders/trash" element={<SalesOrderTrashPage />} />

          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/new" element={<CreateItemPage />} />
          <Route path="/items/trash" element={<TrashItemPage />} />
          <Route path="/items/:itemId/edit" element={<EditItemPage />} />
          <Route path="/categories" element={<CategoryPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
