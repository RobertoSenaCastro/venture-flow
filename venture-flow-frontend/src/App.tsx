import { Navigate, Route, Routes } from "react-router-dom";
import Sidebar from "./app/layout/Sidebar";
import HomePage from "./features/home/pages/HomePage";
import OrdersPage from "./features/sales-orders/pages/SalesOrderPage";
import SalesOrderEditPage from "./features/sales-orders/pages/SalesOrderEditPage";
import "./App.css";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/sales-orders/:salesOrderId/edit" element={<SalesOrderEditPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
