import type { DocumentType } from "../types/resellerAdmin";

export function onlyDocumentDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatDocument(
  value: string,
  documentType: DocumentType,
): string {
  const maxLength = documentType === "CPF" ? 11 : 14;
  const digits = onlyDocumentDigits(value).slice(0, maxLength);

  if (documentType === "CPF") {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function calculateCheckDigit(
  digits: string,
  weights: number[],
): number {
  const sum = weights.reduce(
    (total, weight, index) =>
      total + Number(digits[index]) * weight,
    0,
  );
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDocumentDigits(value);

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const firstDigit = calculateCheckDigit(
    digits.slice(0, 9),
    [10, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondDigit = calculateCheckDigit(
    digits.slice(0, 9) + firstDigit,
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDocumentDigits(value);

  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const firstDigit = calculateCheckDigit(
    digits.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );
  const secondDigit = calculateCheckDigit(
    digits.slice(0, 12) + firstDigit,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  );

  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function isValidDocument(
  value: string,
  documentType: DocumentType,
): boolean {
  return documentType === "CPF"
    ? isValidCpf(value)
    : isValidCnpj(value);
}
