export type DocumentType = "CPF" | "CNPJ";

export interface Reseller {
  id: number;
  name: string;
  documentType: DocumentType;
  documentNumber: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResellerRequest {
  name: string;
  documentType: DocumentType;
  documentNumber: string;
}

export type ResellerFormData = ResellerRequest;

export const INITIAL_RESELLER_FORM_DATA: ResellerFormData = {
  name: "",
  documentType: "CPF",
  documentNumber: "",
};
