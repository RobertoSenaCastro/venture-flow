import { Navigate, Route, Routes } from "react-router";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/SalesOrderPage";

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
