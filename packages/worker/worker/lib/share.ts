/** Short, URL-safe id for a shared diff link — e.g. envdiff.dev/s/k3f9-x7qz. */
export function generateShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o/1/l/i ambiguity
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i === 3) out += "-";
  }
  return out;
}

export const SHARE_EXPIRY_DAYS = 7;

export function shareExpiryTimestamp(): string {
  const expires = new Date(Date.now() + SHARE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return expires.toISOString();
}
