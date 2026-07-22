import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <main className="page">
      <header className="page-header">
        <p className="eyebrow">Overview</p>
        <h1>Welcome to Venture ERP</h1>
        <p className="page-description">
          Manage the factory's main operations from one place.
        </p>
      </header>

      <section className="module-grid">
        <Link to="/orders" className="module-card">
          <div className="module-icon">▤</div>
          <div>
            <h2>Orders</h2>
            <p>Create and manage production orders.</p>
          </div>
          <span className="module-arrow">→</span>
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
