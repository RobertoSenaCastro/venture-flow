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
import ResellerPage from "./features/reseller/pages/ResellerPage";
import CreateResellerPage from "./features/reseller/pages/CreateResellerPage";
import EditResellerPage from "./features/reseller/pages/EditResellerPage";
import TrashResellerPage from "./features/reseller/pages/TrashResellerPage";

import { LoginPage } from "./features/auth/pages/LoginPage";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Routes>
          {/* The only route reachable without a session. */}
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/*
            Sales orders stay open to both roles for now. Narrowing them to what
            a supervisor may see is the next phase, and needs the backend filter
            by assigned supervisor before the pages can rely on it.
          */}
          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateSalesOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders/:salesOrderId/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SalesOrderEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders/trash"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SalesOrderTrashPage />
              </ProtectedRoute>
            }
          />

          {/* Inventory is factory-side only. */}
          <Route
            path="/items"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ItemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/trash"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <TrashItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/items/:itemId/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EditItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CategoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resellers"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ResellerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resellers/new"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CreateResellerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resellers/trash"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <TrashResellerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resellers/:resellerId/edit"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EditResellerPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
