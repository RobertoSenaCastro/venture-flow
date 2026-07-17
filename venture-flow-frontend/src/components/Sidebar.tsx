import { NavLink, type NavLinkRenderProps } from "react-router";

function getLinkClass({ isActive }: NavLinkRenderProps): string {
  return isActive ? "sidebar-link active" : "sidebar-link";
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-symbol">V</div>
        <div>
          <strong>Venture ERP</strong>
          <span>Management system</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <NavLink to="/" end className={getLinkClass}>
          <span className="nav-icon">⌂</span>
          Home
        </NavLink>

        <NavLink to="/orders" className={getLinkClass}>
          <span className="nav-icon">▤</span>
          Orders
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
