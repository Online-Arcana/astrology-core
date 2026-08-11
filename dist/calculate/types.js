export const calculationProfile = "western_natal/1.1.0";
export class CalcError extends Error {
    reason;
    constructor(reason) {
        super(`Chart calculation is unavailable: ${reason}`);
        this.name = "CalcError";
        this.reason = reason;
    }
}
//# sourceMappingURL=types.js.map