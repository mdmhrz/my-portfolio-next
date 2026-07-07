// Pure client-side generation — same trust level as any local password
// manager's generator. No server round-trip, nothing to log or leak in transit.

export interface PasswordOptions {
  length: number;
  symbols: boolean;
  numbers: boolean;
  uppercase: boolean;
  excludeAmbiguous: boolean;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = /[0O1lI|]/g;

function randomIndex(max: number): number {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

export function generatePassword(options: PasswordOptions): string {
  const { length, symbols, numbers, uppercase, excludeAmbiguous } = options;
  let charset = LOWER;
  if (uppercase) charset += UPPER;
  if (numbers) charset += NUMBERS;
  if (symbols) charset += SYMBOLS;
  if (excludeAmbiguous) charset = charset.replace(AMBIGUOUS, "");
  if (charset.length === 0) charset = LOWER;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomIndex(charset.length)];
  }
  return result;
}

export type SecretKind = "hex" | "uuid" | "nanoid" | "jwt-signing-key";

export function generateSecret(kind: SecretKind): string {
  switch (kind) {
    case "uuid":
      return crypto.randomUUID();
    case "hex": {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    case "jwt-signing-key": {
      // 64 random bytes, base64 — sized for HS256/HS512 signing secrets.
      const bytes = new Uint8Array(64);
      crypto.getRandomValues(bytes);
      return btoa(String.fromCharCode(...bytes));
    }
    case "nanoid": {
      const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
      let id = "";
      for (let i = 0; i < 21; i++) {
        id += alphabet[randomIndex(alphabet.length)];
      }
      return id;
    }
  }
}
