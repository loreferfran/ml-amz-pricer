import type { NextApiRequest, NextApiResponse } from "next";
import ExcelJS from "exceljs";
import { supabaseAdmin } from "@lib/supabase";

export const config = { api: { responseLimit: false } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid id" });

  const { data: rows, error } = await supabaseAdmin
    .from("items_output").select("*").eq("job_id", id).order("id", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Resultados");
  ws.columns = [
    { header: "SKU", key: "sku", width: 20 },
    { header: "Canal", key: "channel", width: 12 },
    { header: "Marketplace", key: "marketplace", width: 12 },
    { header: "Precio encontrado", key: "found_price", width: 16 },
    { header: "Moneda", key: "currency", width: 8 },
    { header: "URL", key: "url", width: 40 },
    { header: "Buybox", key: "buybox", width: 8 },
    { header: "Lowest", key: "lowest", width: 12 },
    { header: "Fee estimado", key: "fee_estimate", width: 14 },
    { header: "Precio objetivo", key: "target_price", width: 16 },
    { header: "Bruto OK", key: "margin_bruto_ok", width: 10 },
    { header: "Neto OK", key: "margin_neto_ok", width: 10 }
  ];
  for (const r of rows || []) ws.addRow(r);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="results_${id}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}
