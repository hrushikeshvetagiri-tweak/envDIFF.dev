/** Generates a pro license key like ENVDIFF-A7F3-9K2M-… (40+ chars). */
export function generateLicenseKey(): string {
  // 32 unambiguous chars → ENVDIFF- + 8×4 groups with dashes = 47 characters total.
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if ((i + 1) % 4 === 0 && i !== bytes.length - 1) out += "-";
  }
  return `ENVDIFF-${out}`;
}
