import "../../inventory/styles/ItemFormPage.css";

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../shared/components/BackButton";
import { getResellerById, updateReseller } from "../api/resellerApi";
import ResellerFormFields from "../components/ResellerFormFields";
import { INITIAL_RESELLER_FORM_DATA, type Reseller, type ResellerFormData } from "../types/resellerAdmin";
import { isValidDocument, onlyDocumentDigits } from "../utils/documentValidation";

function EditResellerPage() {
  const navigate = useNavigate();
  const { resellerId } = useParams<{ resellerId: string }>();
  const [reseller, setReseller] = useState<Reseller | null>(null);
  const [formData, setFormData] = useState<ResellerFormData>(INITIAL_RESELLER_FORM_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;
    async function load(): Promise<void> {
      const id = Number(resellerId);
      if (!resellerId || Number.isNaN(id)) {
        setErrorMessage("ID de revenda inválido."); setIsLoading(false); return;
      }
      try {
        const loaded = await getResellerById(id);
        if (!isCancelled) {
          setReseller(loaded);
          setFormData({ name: loaded.name, documentType: loaded.documentType, documentNumber: onlyDocumentDigits(loaded.documentNumber) });
        }
      } catch (error: unknown) {
        if (!isCancelled) setErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao carregar a revenda.");
      } finally { if (!isCancelled) setIsLoading(false); }
    }
    void load();
    return () => { isCancelled = true; };
  }, [resellerId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const id = Number(resellerId);
    const name = formData.name.trim();
    const documentNumber = onlyDocumentDigits(formData.documentNumber);
    if (!resellerId || Number.isNaN(id)) { setSubmitErrorMessage("ID de revenda inválido."); return; }
    if (!name) { setSubmitErrorMessage("O nome da revenda é obrigatório."); return; }
    if (!isValidDocument(documentNumber, formData.documentType)) {
      setSubmitErrorMessage(`${formData.documentType} inválido. Verifique os dígitos informados.`); return;
    }
    try {
      setIsSubmitting(true); setSubmitErrorMessage(""); setSuccessMessage("");
      const updated = await updateReseller(id, { name, documentType: formData.documentType, documentNumber });
      setReseller(updated);
      setFormData({ name: updated.name, documentType: updated.documentType, documentNumber: onlyDocumentDigits(updated.documentNumber) });
      setSuccessMessage("Revenda atualizada com sucesso.");
    } catch (error: unknown) {
      setSubmitErrorMessage(error instanceof Error ? error.message : "Erro inesperado ao atualizar a revenda.");
    } finally { setIsSubmitting(false); }
  }

  return <main className="page item-form-page">
    <BackButton to="/resellers" label="Revendas" />
    <header className="item-form-header"><p className="eyebrow">Administração</p><h1>Editar revenda</h1><p className="page-description">Atualize os dados cadastrais da revenda.</p></header>
    {isLoading && <section className="item-form-card">Carregando revenda...</section>}
    {errorMessage && <section className="item-form-message item-form-error" role="alert">{errorMessage}</section>}
    {!isLoading && !errorMessage && reseller && <form className="item-form-card item-form" onSubmit={(event) => void handleSubmit(event)}>
      <div className="item-form-summary"><div><span>Status</span><strong>{reseller.active ? "Ativa" : "Na lixeira"}</strong></div><div><span>Cadastrada em</span><strong>{new Date(reseller.createdAt).toLocaleDateString("pt-BR")}</strong></div></div>
      <ResellerFormFields formData={formData} isSubmitting={isSubmitting} onChange={setFormData} />
      {submitErrorMessage && <div className="item-form-message item-form-error" role="alert">{submitErrorMessage}</div>}
      {successMessage && <div className="item-form-message item-form-success" role="status">{successMessage}</div>}
      <div className="item-form-actions"><button type="button" className="secondary-button" onClick={() => navigate("/resellers")} disabled={isSubmitting}>Cancelar</button><button type="submit" className="primary-button" disabled={isSubmitting || !formData.name.trim() || !formData.documentNumber}>{isSubmitting ? "Salvando..." : "Salvar alterações"}</button></div>
    </form>}
  </main>;
}

export default EditResellerPage;
