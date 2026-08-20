import type { UserRole } from "./types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  ASSEMBLY_SUPERVISOR: "Supervisor de montagem",
  RESELLER_ADMIN: "Representante de revenda",
};
