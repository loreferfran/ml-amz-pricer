import type { PriceSource, Query, Offer } from "@core/types";

export const amazonSource: PriceSource = {
  id: "amazon",
  async findOffers(q: Query, marketplace: string): Promise<Offer[]> {
    if (!q.asin) return [];
    // TODO: Integrate SP-API getPricing for marketplace (US/MX/CA)
    return [];
  }
};

export async function estimateAmazonFees(asin: string, price: number, marketplace: string): Promise<number> {
  // TODO: Integrate SP-API Fees
  return 0;
}
