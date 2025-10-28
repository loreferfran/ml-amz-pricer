export const targetPrice = (cost: number, pct: number) => cost * (1 + pct / 100);
export const qualifiesGross = (found: number, target: number) => found >= target;
export const qualifiesNet = (found: number, fees: number, target: number) => (found - (fees || 0)) >= target;
