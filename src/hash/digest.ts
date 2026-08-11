const hex = (bytes: Uint8Array): string => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
export const digest = async (algorithm: "SHA-256" | "SHA-512", bytes: Uint8Array): Promise<string> =>
  hex(new Uint8Array(await crypto.subtle.digest(algorithm, bytes.slice().buffer)));
