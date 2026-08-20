import { useEffect, useState } from "react";

import { ROLE_LABELS } from "../../auth/roleLabels";
import ActionMenu from "../../../shared/components/ActionMenu";
import BackButton from "../../../shared/components/BackButton";
import { activateUser, getUserTrash } from "../api/userApi";
import type { User } from "../types/user";
import "../styles/UserPage.css";

function TrashUserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [restoreError, setRestoreError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadUsers(): Promise<void> {
      setIsLoading(true);
      setLoadError("");

      try {
        const deletedUsers = await getUserTrash();

        if (!isCancelled) {
          setUsers(deletedUsers);
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado ao carregar a lixeira de usuários.",
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

  async function handleRestoreUser(user: User): Promise<void> {
    const confirmed = window.confirm(
      `Deseja restaurar o usuário ${user.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setRestoringId(user.id);
    setRestoreError("");

    try {
      await activateUser(user.id);
      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
    } catch (error: unknown) {
      setRestoreError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao restaurar o usuário.",
      );
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <main className="page users-page">
      <BackButton to="/users" label="Usuários" />

      <header className="page-header users-page-header">
        <p className="eyebrow">Administração</p>
        <h1>Lixeira de usuários</h1>
        <p className="page-description">
          Visualize e restaure usuários desativados.
        </p>
      </header>

      {isLoading && (
        <section className="users-loading-card">
          Carregando usuários desativados...
        </section>
      )}

      {loadError && (
        <section className="error-message" role="alert">
          {loadError}
        </section>
      )}

      {restoreError && (
        <section className="error-message" role="alert">
          {restoreError}
        </section>
      )}

      {!isLoading && !loadError && users.length === 0 && (
        <section className="users-empty-state">
          <div className="users-empty-state-icon" aria-hidden="true">
            ♲
          </div>
          <h2>Nenhum usuário na lixeira</h2>
          <p>Usuários desativados aparecerão aqui.</p>
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
                            restoringId === user.id
                              ? "Restaurando..."
                              : "Restaurar",
                          disabled: restoringId === user.id,
                          onClick: () => {
                            void handleRestoreUser(user);
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

export default TrashUserPage;
