export type Query = {
  sku?: string;
  name?: string;
  ean?: string;
  upc?: string;
  asin?: string;
};
export type Offer = {
  title: string;
  price: number;
  url: string;
  currency: string;
  channel: 'meli' | 'amazon';
  marketplace: string;
  buybox?: boolean;
  lowest?: number;
};
export interface PriceSource {
  id: string;
  findOffers(q: Query, marketplace: string): Promise<Offer[]>;
}
