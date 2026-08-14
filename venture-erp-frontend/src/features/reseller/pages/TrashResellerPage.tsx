import "../../inventory/styles/ItemPage.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getResellersTrash, restoreReseller } from "../api/resellerApi";
import type { Reseller } from "../types/resellerAdmin";
import { formatDocument } from "../utils/documentValidation";

function TrashResellerPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [restoreErrorMessage, setRestoreErrorMessage] = useState("");
  const [restoringId, setRestoringId] = useState<number | null>(null);
  useEffect(() => { async function load(): Promise<void> { try { setResellers(await getResellersTrash()); } catch (error: unknown) { setLoadErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao carregar a lixeira."); } finally { setIsLoading(false); } } void load(); }, []);
  async function handleRestore(reseller: Reseller): Promise<void> {
    if (!window.confirm(`Deseja restaurar a revenda ${reseller.name}?`)) return;
    try { setRestoringId(reseller.id); setRestoreErrorMessage(""); await restoreReseller(reseller.id); setResellers((current) => current.filter((item) => item.id !== reseller.id)); }
    catch (error: unknown) { setRestoreErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao restaurar a revenda."); }
    finally { setRestoringId(null); }
  }
  return <main className="page">
    <header className="page-header page-header-row"><div><p className="eyebrow">Administração</p><h1>Lixeira de revendas</h1><p className="page-description">Visualize e restaure revendas desativadas.</p></div><Link to="/resellers" className="secondary-button">Voltar para revendas</Link></header>
    {isLoading && <section className="details-card">Carregando revendas desativadas...</section>}
    {loadErrorMessage && <section className="error-message" role="alert">{loadErrorMessage}</section>}
    {restoreErrorMessage && <section className="error-message" role="alert">{restoreErrorMessage}</section>}
    {!isLoading && !loadErrorMessage && resellers.length === 0 && <section className="empty-state"><div className="empty-state-icon">♲</div><h2>A lixeira está vazia</h2><p>Revendas desativadas aparecerão aqui.</p></section>}
    {!isLoading && !loadErrorMessage && resellers.length > 0 && <section className="item-list">{resellers.map((reseller) => <article className="item-card" key={reseller.id}><div className="item-card-main"><strong>{reseller.documentType}</strong><h2>{reseller.name}</h2><p>{formatDocument(reseller.documentNumber, reseller.documentType)}</p></div><div className="item-card-side"><button type="button" className="secondary-button" disabled={restoringId === reseller.id} onClick={() => void handleRestore(reseller)}>{restoringId === reseller.id ? "Restaurando..." : "Restaurar"}</button></div></article>)}</section>}
  </main>;
}

export default TrashResellerPage;
