// Admin-only server functions for managing applications.
// All handlers verify the caller has the 'admin' role via has_role() before doing anything.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ALLOWED_STATUSES = [
  "draft",
  "under_review",
  "approved",
  "rejected",
  "completed",
  "cancelled",
] as const;

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(`Role check failed: ${error.message}`);
  if (!data) throw new Error("Forbidden: admin role required");
}

// ── List applications with filters ─────────────────────────────
export const listApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.enum(ALLOWED_STATUSES).optional(),
        insuranceType: z.string().min(1).max(64).optional(),
        currentStep: z.string().min(1).max(64).optional(),
        customerId: z.string().min(1).max(128).optional(),
        search: z.string().min(1).max(128).optional(),
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).max(10_000).default(0),
        orderBy: z
          .enum(["created_at", "updated_at", "last_activity_at"])
          .default("last_activity_at"),
        ascending: z.boolean().default(false),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("applications")
      .select("*", { count: "exact" });

    if (data.status) q = q.eq("overall_status", data.status);
    if (data.insuranceType) q = q.eq("insurance_type", data.insuranceType);
    if (data.currentStep) q = q.eq("current_step", data.currentStep);
    if (data.customerId) q = q.eq("customer_id", data.customerId);
    if (data.since) q = q.gte("created_at", data.since);
    if (data.until) q = q.lte("created_at", data.until);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, "");
      q = q.or(`application_id.ilike.%${s}%,customer_id.ilike.%${s}%`);
    }

    q = q
      .order(data.orderBy, { ascending: data.ascending })
      .range(data.offset, data.offset + data.limit - 1);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], total: count ?? 0, limit: data.limit, offset: data.offset };
  });

// ── Get one application with its steps ─────────────────────────
export const getApplicationDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const [app, steps, history] = await Promise.all([
      context.supabase.from("applications").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("application_steps")
        .select("*")
        .eq("application_id", data.id)
        .order("step_order", { ascending: true }),
      context.supabase
        .from("application_history")
        .select("*")
        .eq("application_id", data.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    if (app.error) throw new Error(app.error.message);
    if (!app.data) throw new Error("Application not found");
    if (steps.error) throw new Error(steps.error.message);
    if (history.error) throw new Error(history.error.message);
    return { application: app.data, steps: steps.data ?? [], history: history.data ?? [] };
  });

// ── Update application (status / current step / metadata merge) ─
export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        overallStatus: z.enum(ALLOWED_STATUSES).optional(),
        currentStep: z.string().min(1).max(64).nullable().optional(),
        insuranceType: z.string().min(1).max(64).optional(),
        metadataPatch: z.record(z.string(), z.unknown()).optional(),
      })
      .refine(
        (v) =>
          v.overallStatus !== undefined ||
          v.currentStep !== undefined ||
          v.insuranceType !== undefined ||
          v.metadataPatch !== undefined,
        { message: "At least one field must be provided" },
      )
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    };
    if (data.overallStatus !== undefined) patch["overall_status"] = data.overallStatus;
    if (data.currentStep !== undefined) patch["current_step"] = data.currentStep;
    if (data.insuranceType !== undefined) patch["insurance_type"] = data.insuranceType;

    if (data.metadataPatch) {
      const { data: existing, error: readErr } = await context.supabase
        .from("applications")
        .select("metadata")
        .eq("id", data.id)
        .maybeSingle();
      if (readErr) throw new Error(readErr.message);
      if (!existing) throw new Error("Application not found");
      const prev = (existing.metadata as Record<string, unknown> | null) ?? {};
      patch["metadata"] = { ...prev, ...data.metadataPatch };
    }

    const { data: updated, error } = await context.supabase
      .from("applications")
      .update(patch as never)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    await context.supabase.from("application_history").insert({
      application_id: data.id,
      event_type: "application_updated",
      actor: "admin",
      details: {
        admin_id: context.userId,
        changes: {
          overall_status: data.overallStatus,
          current_step: data.currentStep,
          insurance_type: data.insuranceType,
          metadata_patch_keys: data.metadataPatch ? Object.keys(data.metadataPatch) : undefined,
        },
      },
    });

    return updated;
  });
