import type { NextApiRequest, NextApiResponse } from "next";
import { supabaseAdmin } from "@lib/supabase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid id" });
  const { data: job } = await supabaseAdmin.from("jobs").select("*").eq("id", id).single();
  const { count } = await supabaseAdmin.from("items_output").select("*", { count: "exact", head: true }).eq("job_id", id);
  res.status(200).json({ job, results_count: count || 0 });
}
