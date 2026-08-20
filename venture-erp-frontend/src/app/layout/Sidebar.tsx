import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { ROLE_LABELS } from "../../features/auth/roleLabels";
import { getNavigationItems } from "./navigationItems";
import "./Sidebar.css";

function getLinkClass({ isActive }: NavLinkRenderProps): string {
  return isActive ? "sidebar-link active" : "sidebar-link";
}

function Sidebar() {
  const { user, signOut } = useAuth();

  // Nothing to navigate to before signing in, and the login page should not
  // show the shell of an application the visitor cannot reach.
  if (!user) {
    return null;
  }

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
        {getNavigationItems(user.role).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={getLinkClass}
          >
            {item.icon && <span className="nav-icon">{item.icon}</span>}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <strong>{user.name}</strong>
          <span>{ROLE_LABELS[user.role]}</span>
        </div>
        <button type="button" className="sidebar-signout" onClick={signOut}>
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
