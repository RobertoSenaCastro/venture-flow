import "../../inventory/styles/ItemFormPage.css";

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from
  "../../../shared/components/BackButton";

import { createReseller } from "../api/resellerApi";
import ResellerFormFields from "../components/ResellerFormFields";
import {
  INITIAL_RESELLER_FORM_DATA,
  type ResellerFormData,
} from "../types/resellerAdmin";
import {
  isValidDocument,
  onlyDocumentDigits,
} from "../utils/documentValidation";

function CreateResellerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResellerFormData>(INITIAL_RESELLER_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const name = formData.name.trim();
    const documentNumber = onlyDocumentDigits(formData.documentNumber);

    if (!name) {
      setSubmitErrorMessage("O nome da revenda é obrigatório.");
      return;
    }
    if (!isValidDocument(documentNumber, formData.documentType)) {
      setSubmitErrorMessage(`${formData.documentType} inválido. Verifique os dígitos informados.`);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitErrorMessage("");
      await createReseller({ name, documentType: formData.documentType, documentNumber });
      navigate("/resellers");
    } catch (error: unknown) {
      setSubmitErrorMessage(
        error instanceof Error ? error.message : "Ocorreu um erro inesperado ao criar a revenda.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page item-form-page">
      <BackButton
        to="/resellers"
        label="Revendas"
      />

      <header className="item-form-header">
        <p className="eyebrow">Administração</p>
        <h1>Nova revenda</h1>
        <p className="page-description">Informe os dados cadastrais da revenda.</p>
      </header>
      <section className="item-form-card">
        <form className="item-form" onSubmit={(event) => void handleSubmit(event)}>
          <ResellerFormFields
            formData={formData}
            isSubmitting={isSubmitting}
            onChange={setFormData}
          />
          {submitErrorMessage && (
            <div className="item-form-message item-form-error" role="alert">
              {submitErrorMessage}
            </div>
          )}
          <div className="item-form-actions">
            <button type="button" className="secondary-button" onClick={() => navigate("/resellers")} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={isSubmitting || !formData.name.trim() || !formData.documentNumber}>
              {isSubmitting ? "Criando..." : "Criar revenda"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreateResellerPage;
