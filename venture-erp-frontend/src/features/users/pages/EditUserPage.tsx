import "../../inventory/styles/ItemFormPage.css";
import "../styles/EditUserPage.css";

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import BackButton from "../../../shared/components/BackButton";
import { ROLE_LABELS } from "../../auth/roleLabels";
import { changeUserPassword, getUserById, updateUser } from "../api/userApi";
import type { User } from "../types/user";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UserFormData {
  name: string;
  email: string;
}

function EditUserPage() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ name: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [password, setPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadUser(): Promise<void> {
      const parsedUserId = Number(userId);

      if (!userId || Number.isNaN(parsedUserId)) {
        setErrorMessage("ID de usuário inválido.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const loadedUser = await getUserById(parsedUserId);

        if (!isCancelled) {
          setUser(loadedUser);
          setFormData({ name: loadedUser.name, email: loadedUser.email });
        }
      } catch (error: unknown) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado ao carregar o usuário.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const parsedUserId = Number(userId);
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!userId || Number.isNaN(parsedUserId) || !user) {
      setSubmitErrorMessage("ID de usuário inválido.");
      return;
    }

    if (!name) {
      setSubmitErrorMessage("O nome é obrigatório.");
      return;
    }

    if (!email) {
      setSubmitErrorMessage("O e-mail é obrigatório.");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setSubmitErrorMessage("Informe um e-mail em formato válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");
      setSuccessMessage("");

      const updatedUser = await updateUser(parsedUserId, {
        name,
        email,
        // Role and reseller are read-only on this page but the endpoint
        // replaces the whole record, so the current values must be resent.
        role: user.role,
        resellerId: user.resellerId,
      });

      setUser(updatedUser);
      setFormData({ name: updatedUser.name, email: updatedUser.email });
      setSuccessMessage("Usuário atualizado com sucesso.");
    } catch (error: unknown) {
      setSubmitErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao atualizar o usuário.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const parsedUserId = Number(userId);

    if (!userId || Number.isNaN(parsedUserId)) {
      setPasswordErrorMessage("ID de usuário inválido.");
      return;
    }

    if (password.length < 8 || password.length > 100) {
      setPasswordErrorMessage("A senha deve ter entre 8 e 100 caracteres.");
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordErrorMessage("");
      setPasswordSuccessMessage("");

      await changeUserPassword(parsedUserId, { password });

      setPassword("");
      setPasswordSuccessMessage("Senha alterada com sucesso.");
    } catch (error: unknown) {
      setPasswordErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao alterar a senha.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <main className="page item-form-page">
      <BackButton to="/users" label="Usuários" />

      <header className="item-form-header">
        <p className="eyebrow">Administração</p>
        <h1>Editar usuário</h1>
        <p className="page-description">
          Atualize o nome e o e-mail do usuário. Papel e revenda não podem ser
          alterados por aqui.
        </p>
      </header>

      {isLoading && <section className="item-form-card">Carregando usuário...</section>}

      {errorMessage && (
        <section className="item-form-message item-form-error" role="alert">
          {errorMessage}
        </section>
      )}

      {!isLoading && !errorMessage && user && (
        <>
          <form
            className="item-form-card item-form"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="item-form-summary">
              <div>
                <span>Papel</span>
                <strong>{ROLE_LABELS[user.role]}</strong>
              </div>
              <div>
                <span>Revenda</span>
                <strong>{user.resellerName ?? "—"}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{user.active ? "Ativo" : "Na lixeira"}</strong>
              </div>
              <div>
                <span>Cadastrado em</span>
                <strong>{new Date(user.createdAt).toLocaleDateString("pt-BR")}</strong>
              </div>
            </div>

            <div className="item-form-field">
              <label htmlFor="user-name">Nome</label>
              <input
                id="user-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, name: event.target.value }))
                }
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="item-form-field">
              <label htmlFor="user-email">E-mail</label>
              <input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, email: event.target.value }))
                }
                disabled={isSubmitting}
                required
              />
            </div>

            {submitErrorMessage && (
              <div className="item-form-message item-form-error" role="alert">
                {submitErrorMessage}
              </div>
            )}

            {successMessage && (
              <div className="item-form-message item-form-success" role="status">
                {successMessage}
              </div>
            )}

            <div className="item-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => navigate("/users")}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()}
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </form>

          <form
            className="item-form-card item-form edit-user-password-card"
            onSubmit={(event) => void handleChangePassword(event)}
          >
            <header className="edit-user-password-header">
              <h2>Alterar senha</h2>
              <p className="page-description">
                Defina uma nova senha para este usuário. Essa alteração é
                independente dos dados acima.
              </p>
            </header>

            <div className="item-form-field">
              <label htmlFor="user-password">Nova senha</label>
              <input
                id="user-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isChangingPassword}
                minLength={8}
                maxLength={100}
                autoComplete="new-password"
              />
              <p className="item-form-hint">Deve ter entre 8 e 100 caracteres.</p>
            </div>

            {passwordErrorMessage && (
              <div className="item-form-message item-form-error" role="alert">
                {passwordErrorMessage}
              </div>
            )}

            {passwordSuccessMessage && (
              <div className="item-form-message item-form-success" role="status">
                {passwordSuccessMessage}
              </div>
            )}

            <div className="item-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={isChangingPassword || password.length < 8}
              >
                {isChangingPassword ? "Alterando..." : "Alterar senha"}
              </button>
            </div>
          </form>
        </>
      )}
    </main>
  );
}

export default EditUserPage;
