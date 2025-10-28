import fetch from "node-fetch";
import type { PriceSource, Query, Offer } from "@core/types";

const SITES: Record<string, string> = {
  "MLA": "MLA", "MLB": "MLB", "MLM": "MLM", "MLC": "MLC",
  "MCO": "MCO", "MPE": "MPE", "MLU": "MLU"
};

export const meliSource: PriceSource = {
  id: "meli",
  async findOffers(q: Query, marketplace: string): Promise<Offer[]> {
    const site = SITES[marketplace] || "MLC";
    const query = q.ean || q.name || q.sku || "";
    if (!query) return [];
    const url = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 10).map((r: any) => ({
      title: r.title, price: r.price, url: r.permalink,
      currency: r.currency_id || "CLP", channel: "meli", marketplace
    }));
  }
};
