import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { supabaseAdmin } from "@lib/supabase";
import { priceQueue } from "@lib/queue";

const Body = z.object({
  margin_pct: z.number().min(0).max(500),
  channel: z.enum(["meli", "amazon"]),
  marketplace: z.string().min(2).max(10),
  file_url: z.string().url()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { margin_pct, channel, marketplace, file_url } = parsed.data;

  const { data: jobRow, error } = await supabaseAdmin
    .from("jobs").insert({ margin_pct, channel, marketplace, file_url, status: "queued" })
    .select("id").single();
  if (error) return res.status(500).json({ error: error.message });

  await priceQueue.add("process", { jobId: jobRow.id, margin_pct, channel, marketplace, file_url });
  res.status(200).json({ job_id: jobRow.id, status: "queued" });
}
