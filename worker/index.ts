import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import fetch from "node-fetch";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@lib/supabase";
import { targetPrice, qualifiesGross, qualifiesNet } from "@core/margin";
import type { Query } from "@core/types";
import { meliSource } from "@adapters/mercadolibre";
import { amazonSource, estimateAmazonFees } from "@adapters/amazon-spapi";

const connection = new IORedis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });

type Payload = {
  jobId: string;
  margin_pct: number;
  channel: "meli" | "amazon";
  marketplace: string;
  file_url: string;
};

async function parseInputFile(fileUrl: string) {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Cannot download input file");
  const buf = await res.buffer();
  const wb = XLSX.read(buf, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows;
}

async function processRow(row: any, payload: Payload) {
  const sku = (row.sku || row.SKU || row.Sku || "").toString().trim();
  const name = (row.name || row.Nombre || "").toString().trim();
  const costRaw = row.cost ?? row.Costo ?? row.price_cost ?? row.COST;
  const cost = Number(costRaw);
  const ean = (row.ean || row.EAN || "").toString().trim();
  const upc = (row.upc || row.UPC || "").toString().trim();
  const asin = (row.asin || row.ASIN || "").toString().trim();
  if (!sku) return;
  if (!Number.isFinite(cost)) return;

  const { data: map } = await supabaseAdmin.from("sku_map").select("*").eq("sku", sku).maybeSingle();
  const q: Query = { sku, name, ean: ean || map?.ean || undefined, upc: upc || map?.upc || undefined, asin: asin || map?.asin || undefined };

  const source = payload.channel === "meli" ? meliSource : amazonSource;
  const offers = await source.findOffers(q, payload.marketplace);
  if (!offers.length) return;

  for (const off of offers) {
    const target = targetPrice(cost, payload.margin_pct);
    const fees = off.channel === "amazon" ? await estimateAmazonFees(q.asin || "", off.price, payload.marketplace) : 0;
    const brutoOk = qualifiesGross(off.price, target);
    const netoOk  = qualifiesNet(off.price, fees, target);
    await supabaseAdmin.from("items_output").insert({
      job_id: payload.jobId, row_idx: 0, sku,
      channel: off.channel, marketplace: payload.marketplace,
      found_price: off.price, currency: off.currency, url: off.url,
      buybox: off.buybox ?? null, lowest: off.lowest ?? null,
      fee_estimate: fees, target_price: target,
      margin_bruto_ok: brutoOk, margin_neto_ok: netoOk
    });
  }
}

async function processJob(job: Job<Payload>) {
  const payload = job.data;
  await supabaseAdmin.from("jobs").update({ status: "running" }).eq("id", payload.jobId);
  try {
    const rows = await parseInputFile(payload.file_url);
    let idx = 0;
    for (const row of rows) {
      idx += 1;
      await processRow(row, payload);
      if (idx % 50 === 0) await new Promise(r => setTimeout(r, 300));
    }
    await supabaseAdmin.from("jobs").update({ status: "done", finished_at: new Date().toISOString() }).eq("id", payload.jobId);
  } catch (e) {
    await supabaseAdmin.from("jobs").update({ status: "error" }).eq("id", payload.jobId);
    console.error("Worker error:", e);
  }
}

new Worker<Payload>("price-jobs", processJob, { connection });
console.log("Worker started: queue = price-jobs");
