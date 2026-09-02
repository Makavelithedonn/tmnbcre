import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import postgres from 'postgres'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const quoteSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(320).optional(),
  phone: z.string().max(30).optional(),
  nationalId: z.string().max(20).optional(),
  insuranceType: z.string().max(50).optional(),
  vehicleMake: z.string().max(80).optional(),
  vehicleModel: z.string().max(80).optional(),
  modelYear: z.number().int().min(1980).max(2100).optional(),
  declaredValue: z.number().nonnegative().optional(),
  insurerCompany: z.string().max(120).optional(),
  insurerOfferSar: z.number().nonnegative().optional(),
})

function getClient() {
  const url = process.env['DATABASE_URL']
  if (!url) throw new Error('DATABASE_URL is not configured')
  return postgres(url, { max: 1, prepare: false })
}

export const Route = createFileRoute('/api/public/quote-requests')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders })
        }

        const parsed = quoteSchema.safeParse(body)
        if (!parsed.success) {
          return Response.json(
            { error: 'Validation failed', issues: parsed.error.issues.map((i) => i.path.join('.')) },
            { status: 422, headers: corsHeaders },
          )
        }
        const d = parsed.data

        const sql = getClient()
        try {
          const rows = await sql`
            INSERT INTO quote_requests
              (name, email, phone, national_id, insurance_type, vehicle_make, vehicle_model,
               model_year, declared_value, insurer_company, insurer_offer_sar, payload)
            VALUES
              (${d.name}, ${d.email ?? null}, ${d.phone ?? null}, ${d.nationalId ?? null},
               ${d.insuranceType ?? null}, ${d.vehicleMake ?? null}, ${d.vehicleModel ?? null},
               ${d.modelYear ?? null}, ${d.declaredValue ?? null}, ${d.insurerCompany ?? null},
               ${d.insurerOfferSar ?? null}, ${sql.json(d)})
            RETURNING id
          `
          const id = rows[0]?.id
          await sql`
            INSERT INTO quote_activity (quote_request_id, actor, action, note)
            VALUES (${id}, 'public', 'created', 'Quote request submitted')
          `
          return Response.json({ ok: true, id }, { status: 201, headers: corsHeaders })
        } finally {
          await sql.end({ timeout: 5 }).catch(() => {})
        }
      },
    },
  },
})
