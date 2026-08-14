import type { ChangeEvent } from "react";

import type {
  DocumentType,
  ResellerFormData,
} from "../types/resellerAdmin";
import {
  formatDocument,
  onlyDocumentDigits,
} from "../utils/documentValidation";

interface ResellerFormFieldsProps {
  formData: ResellerFormData;
  isSubmitting: boolean;
  onChange: (formData: ResellerFormData) => void;
}

function ResellerFormFields({
  formData,
  isSubmitting,
  onChange,
}: ResellerFormFieldsProps) {
  function handleNameChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    onChange({ ...formData, name: event.target.value });
  }

  function handleDocumentTypeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ): void {
    onChange({
      ...formData,
      documentType: event.target.value as DocumentType,
      documentNumber: "",
    });
  }

  function handleDocumentNumberChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const maxLength = formData.documentType === "CPF" ? 11 : 14;
    onChange({
      ...formData,
      documentNumber: onlyDocumentDigits(event.target.value).slice(0, maxLength),
    });
  }

  return (
    <>
      <div className="item-form-field">
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          maxLength={150}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="item-form-row">
        <div className="item-form-field">
          <label htmlFor="documentType">Tipo de documento</label>
          <select
            id="documentType"
            name="documentType"
            value={formData.documentType}
            onChange={handleDocumentTypeChange}
            disabled={isSubmitting}
            required
          >
            <option value="CPF">CPF</option>
            <option value="CNPJ">CNPJ</option>
          </select>
        </div>

        <div className="item-form-field">
          <label htmlFor="documentNumber">Número do documento</label>
          <input
            id="documentNumber"
            name="documentNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatDocument(
              formData.documentNumber,
              formData.documentType,
            )}
            onChange={handleDocumentNumberChange}
            maxLength={formData.documentType === "CPF" ? 14 : 18}
            disabled={isSubmitting}
            required
          />
          <p className="item-form-hint">
            Digite somente números. A pontuação é adicionada automaticamente.
          </p>
        </div>
      </div>
    </>
  );
}

export default ResellerFormFields;
