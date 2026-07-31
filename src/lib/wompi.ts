// src/lib/wompi.ts — helpers de Wompi (Web Checkout + eventos)
// Docs: https://docs.wompi.co/ · Llaves en .env:
//   WOMPI_PUBLIC_KEY (pub_prod_…) · INTEGRIDAD_KEY (firma de integridad)
//   SECRET_EVENT (verificación de eventos/webhooks)
import { createHash } from "crypto";

const WOMPI_CHECKOUT_BASE = "https://checkout.wompi.co/p/";

export function getWompiPublicKey(): string {
  const key = process.env.WOMPI_PUBLIC_KEY;
  if (!key) throw new Error("WOMPI_PUBLIC_KEY no configurada");
  return key;
}

/** Firma de integridad: SHA256(referencia + montoEnCentavos + moneda + secreto). */
export function buildIntegritySignature(
  reference: string,
  amountInCents: number,
  currency = "COP"
): string {
  const secret = process.env.INTEGRIDAD_KEY;
  if (!secret) throw new Error("INTEGRIDAD_KEY no configurada");
  return createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${secret}`)
    .digest("hex");
}

export function buildWompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  currency?: string;
}): string {
  const currency = params.currency ?? "COP";
  const search = new URLSearchParams({
    "public-key": getWompiPublicKey(),
    currency,
    "amount-in-cents": String(params.amountInCents),
    reference: params.reference,
    "signature:integrity": buildIntegritySignature(
      params.reference,
      params.amountInCents,
      currency
    ),
    "redirect-url": params.redirectUrl,
  });
  return `${WOMPI_CHECKOUT_BASE}?${search.toString()}`;
}

/**
 * Verifica el checksum de un evento de Wompi.
 * checksum = SHA256(valores de signature.properties en orden + timestamp + SECRET_EVENT)
 */
export function verifyWompiEventChecksum(event: {
  data: Record<string, unknown>;
  timestamp: number;
  signature: { properties: string[]; checksum: string };
}): boolean {
  const secret = process.env.SECRET_EVENT;
  if (!secret) return false;

  const readProperty = (path: string): string => {
    let value: unknown = event.data;
    for (const part of path.split(".")) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return "";
      }
    }
    return String(value ?? "");
  };

  const concatenated =
    event.signature.properties.map(readProperty).join("") +
    String(event.timestamp) +
    secret;

  const expected = createHash("sha256").update(concatenated).digest("hex");
  return expected === event.signature.checksum.toLowerCase();
}
