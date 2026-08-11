const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
export const digest = async (algorithm, bytes) => hex(new Uint8Array(await crypto.subtle.digest(algorithm, bytes.slice().buffer)));
//# sourceMappingURL=digest.js.map