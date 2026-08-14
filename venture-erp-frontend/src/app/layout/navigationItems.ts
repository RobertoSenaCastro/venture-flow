import type { UserRole } from "../../features/auth/types/auth";

export interface NavigationItem {
  label: string;
  to: string;
  icon?: string;
  /** Match only the exact path, for the root link. */
  end?: boolean;
}

/**
 * Navigation derived from the role instead of a fixed list.
 *
 * Hiding a link is convenience, not restriction: the route is still wrapped in
 * ProtectedRoute, and the endpoint behind it still checks the role server side.
 */
const NAVIGATION_BY_ROLE: Record<UserRole, NavigationItem[]> = {
  ADMIN: [
    { label: "Home", to: "/", icon: "⌂", end: true },
    { label: "Pedidos de venda", to: "/sales-orders", icon: "▤" },
    { label: "Estoque", to: "/items", icon: "▦" },
    { label: "Categorias", to: "/categories", icon: "◫" },
    { label: "Revendas", to: "/resellers", icon: "◇" },
  ],
  ASSEMBLY_SUPERVISOR: [
    { label: "Home", to: "/", icon: "⌂", end: true },
    { label: "Pedidos de venda", to: "/sales-orders", icon: "▤" },
  ],
};

export function getNavigationItems(role: UserRole): NavigationItem[] {
  return NAVIGATION_BY_ROLE[role] ?? [];
}
