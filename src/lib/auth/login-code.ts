import { createHash, randomInt } from "crypto";

export function createLoginCode() {
  return String(randomInt(100000, 999999));
}

export function hashLoginCode(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export function getLoginCodeExpiry() {
  return new Date(Date.now() + 10 * 60 * 1000);
}
