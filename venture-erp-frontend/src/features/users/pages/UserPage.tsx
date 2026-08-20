import { useEffect, useState } from "react";

import { ROLE_LABELS } from "../../auth/roleLabels";
import ActionMenu from "../../../shared/components/ActionMenu";
import BackButton from "../../../shared/components/BackButton";
import { deactivateUser, getUsers } from "../api/userApi";
import type { User } from "../types/user";
import "../styles/UserPage.css";

function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);
  const [deactivateError, setDeactivateError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers(): Promise<void> {
      setIsLoading(true);
      setLoadError("");

      try {
        const loadedUsers = await getUsers();

        if (!isCancelled) {
          setUsers(loadedUsers);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado ao carregar os usuários.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleDeactivateUser(user: User): Promise<void> {
    const confirmed = window.confirm(
      `Deseja desativar o usuário ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setDeactivatingId(user.id);
    setDeactivateError("");

    try {
      await deactivateUser(user.id);
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
    } catch (error: unknown) {
      setDeactivateError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao desativar o usuário.",
      );
    } finally {
      setDeactivatingId(null);
    }
  }

  return (
    <main className="page users-page">
      <BackButton to="/" label="Home" />

      <header className="page-header users-page-header">
        <p className="eyebrow">Administração</p>
        <h1>Usuários</h1>
        <p className="page-description">Gerencie os usuários do sistema.</p>
      </header>

      {isLoading && (
        <section className="users-loading-card">Carregando usuários...</section>
      )}

      {loadError && (
        <section className="error-message" role="alert">
          {loadError}
        </section>
      )}

      {deactivateError && (
        <section className="error-message" role="alert">
          {deactivateError}
        </section>
      )}

      {!isLoading && !loadError && users.length === 0 && (
        <section className="users-empty-state">
          <div className="users-empty-state-icon" aria-hidden="true">
            ♙
          </div>
          <h2>Nenhum usuário encontrado</h2>
          <p>Não há usuários ativos para exibir.</p>
        </section>
      )}

      {!isLoading && !loadError && users.length > 0 && (
        <section className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">Nome</th>
                <th scope="col">E-mail</th>
                <th scope="col">Papel</th>
                <th scope="col" className="user-reseller-column">
                  Revenda
                </th>
                <th scope="col" className="users-actions-heading">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td className="user-email">{user.email}</td>
                  <td>{ROLE_LABELS[user.role]}</td>
                  <td className="user-reseller-column">
                    {user.resellerName ?? "—"}
                  </td>
                  <td className="user-actions">
                    <ActionMenu
                      ariaLabel={`Abrir opções para ${user.name}`}
                      items={[
                        {
                          label:
                            deactivatingId === user.id
                              ? "Desativando..."
                              : "Desativar",
                          variant: "danger",
                          disabled: deactivatingId === user.id,
                          onClick: () => {
                            void handleDeactivateUser(user);
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}

export default UserPage;
