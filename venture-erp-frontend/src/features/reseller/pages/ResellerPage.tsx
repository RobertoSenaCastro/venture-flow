import "../../inventory/styles/ItemPage.css";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  getResellersDetails,
  softDeleteReseller,
} from "../api/resellerApi";
import type { Reseller } from "../types/resellerAdmin";
import { formatDocument } from "../utils/documentValidation";

function ResellerPage() {
  const navigate = useNavigate();
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [openMenuResellerId, setOpenMenuResellerId] = useState<number | null>(null);
  const [deletingResellerId, setDeletingResellerId] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadResellers(): Promise<void> {
      try {
        setIsLoading(true);
        setLoadErrorMessage("");
        const loadedResellers = await getResellersDetails();
        if (!isCancelled) setResellers(loadedResellers);
      } catch (error: unknown) {
        if (!isCancelled) {
          setLoadErrorMessage(
            error instanceof Error
              ? error.message
              : "Ocorreu um erro inesperado ao carregar as revendas.",
          );
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    void loadResellers();
    return () => { isCancelled = true; };
  }, []);

  const visibleResellers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return resellers;
    return resellers.filter((reseller) =>
      reseller.name.toLowerCase().includes(search) ||
      reseller.documentNumber.includes(search.replace(/\D/g, "")),
    );
  }, [resellers, searchTerm]);

  async function handleSoftDelete(reseller: Reseller): Promise<void> {
    if (!window.confirm(`Deseja desativar a revenda ${reseller.name}?`)) return;

    setDeletingResellerId(reseller.id);
    setDeleteErrorMessage("");
    setOpenMenuResellerId(null);
    try {
      await softDeleteReseller(reseller.id);
      setResellers((current) => current.filter((item) => item.id !== reseller.id));
    } catch (error: unknown) {
      setDeleteErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado ao desativar a revenda.",
      );
    } finally {
      setDeletingResellerId(null);
    }
  }

  return (
    <main className="page">
      <header className="page-header page-header-row">
        <div>
          <p className="eyebrow">Administração</p>
          <h1>Revendas</h1>
          <p className="page-description">
            Cadastre e mantenha os dados das revendas.
          </p>
        </div>
        <div className="page-header-actions">
          <Link to="/resellers/trash" className="secondary-button trash-link">
            Lixeira
          </Link>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/resellers/new")}
          >
            Nova revenda
          </button>
        </div>
      </header>

      <section className="item-filters">
        <div className="item-filter-field">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome ou documento"
          />
        </div>
      </section>

      {isLoading && <section className="details-card">Carregando revendas...</section>}
      {loadErrorMessage && <section className="error-message" role="alert">{loadErrorMessage}</section>}
      {deleteErrorMessage && <section className="error-message" role="alert">{deleteErrorMessage}</section>}

      {!isLoading && !loadErrorMessage && visibleResellers.length === 0 && (
        <section className="empty-state">
          <div className="empty-state-icon">◇</div>
          <h2>Nenhuma revenda encontrada</h2>
          <p>Clique em <strong>Nova revenda</strong> para cadastrar.</p>
        </section>
      )}

      {!isLoading && !loadErrorMessage && visibleResellers.length > 0 && (
        <section className="item-list">
          {visibleResellers.map((reseller) => (
            <article className="item-card" key={reseller.id}>
              <div className="item-card-main">
                <strong>{reseller.documentType}</strong>
                <h2>{reseller.name}</h2>
                <p>{formatDocument(reseller.documentNumber, reseller.documentType)}</p>
              </div>
              <div className="item-card-side">
                <div className="item-actions">
                  <button
                    type="button"
                    className="item-menu-button"
                    onClick={() => setOpenMenuResellerId((current) =>
                      current === reseller.id ? null : reseller.id
                    )}
                    aria-label={`Abrir opções de ${reseller.name}`}
                    aria-expanded={openMenuResellerId === reseller.id}
                  >
                    ⋮
                  </button>
                  {openMenuResellerId === reseller.id && (
                    <div className="item-menu">
                      <button
                        type="button"
                        className="item-menu-item"
                        onClick={() => navigate(`/resellers/${reseller.id}/edit`)}
                      >
                        Editar revenda
                      </button>
                      <button
                        type="button"
                        className="item-menu-item item-menu-item-danger"
                        onClick={() => void handleSoftDelete(reseller)}
                        disabled={deletingResellerId === reseller.id}
                      >
                        {deletingResellerId === reseller.id ? "Desativando..." : "Desativar"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default ResellerPage;
