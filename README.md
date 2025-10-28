# ML/AMZ Pricer – Starter

API + Worker para comparar listas (Mercado Libre y Amazon).
- Next.js (API Routes)
- BullMQ + Redis (Upstash)
- Supabase (DB/Storage)
- ExcelJS (.xlsx)
- Meli público listo / Amazon SP-API (pendiente de credenciales)

## Endpoints API
- POST /api/jobs
- GET /api/jobs/[id]
- GET /api/jobs/[id]/results.xlsx

## Arranque
1) Copia `.env.example` a `.env` (en Vercel/worker usa env vars).
2) Crea tablas con `sql/schema.sql` en Supabase.
3) `npm i`
4) `npm run dev` (API) y en otro servicio `npm run worker` (worker).
