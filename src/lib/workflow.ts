// BeCaree workflow client — wraps the Supabase workflow tables.
// Mirrors the bolt project's lib/api.ts but uses the generated supabase client.
import { supabase } from "@/integrations/supabase/client";

// ── Step definitions (matched to the funnel routes) ──────────
export interface StepDefinition {
  key: string;
  title: string;
  order: number;
  route: string;
  description: string;
}

export const APPLICATION_STEPS: StepDefinition[] = [
  { key: "insurance_quote", title: "عرض التأمين", order: 1, route: "/insurance/car", description: "اختيار نوع التأمين ومقارنة العروض" },
  { key: "customer_info", title: "بيانات مقدم الطلب", order: 2, route: "/reg", description: "إدخال البيانات الشخصية وبيانات المركبة" },
  { key: "phone_verification", title: "تأكيد رقم الهاتف", order: 3, route: "/phone", description: "تأكيد رقم الجوال عبر رمز التحقق" },
  { key: "payment", title: "الدفع", order: 4, route: "/payment", description: "إتمام عملية الدفع عبر مزود الدفع الآمن" },
  { key: "confirmation", title: "تأكيد الطلب", order: 5, route: "/success", description: "تأكيد إصدار الوثيقة وربطها مع نظام المرور" },
];

export function getStepByKey(key: string): StepDefinition | undefined {
  return APPLICATION_STEPS.find((s) => s.key === key);
}

export function getNextStep(currentKey: string): StepDefinition | undefined {
  const current = APPLICATION_STEPS.find((s) => s.key === currentKey);
  if (!current) return undefined;
  return APPLICATION_STEPS.find((s) => s.order === current.order + 1);
}

// ── Types ─────────────────────────────────────────────────────
export interface ApplicationRow {
  id: string;
  application_id: string;
  customer_id: string;
  overall_status: string;
  current_step: string | null;
  insurance_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface ApplicationStepRow {
  id: string;
  application_id: string;
  step_key: string;
  title: string;
  step_order: number;
  status: string;
  data: Record<string, unknown> | null;
  locked: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithSteps {
  application: ApplicationRow;
  steps: ApplicationStepRow[];
}

// ── ID helpers ─────────────────────────────────────────────────
export function generateApplicationId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "APP-";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export function getOrCreateCustomerId(): string {
  const KEY = "becaree_customer_id";
  let id = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
  if (!id) {
    id = "cust-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, id);
  }
  return id;
}

export function getStoredApplicationId(): string | null {
  return typeof window !== "undefined" ? window.localStorage.getItem("becaree_application_id") : null;
}

export function storeApplicationId(id: string): void {
  if (typeof window !== "undefined") window.localStorage.setItem("becaree_application_id", id);
}

export function clearStoredApplicationId(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem("becaree_application_id");
}

// ── Application lifecycle ─────────────────────────────────────
export async function createApplication(insuranceType?: string): Promise<ApplicationWithSteps | null> {
  const applicationId = generateApplicationId();
  const customerId = getOrCreateCustomerId();

  const { data: app, error: appError } = await supabase
    .from("applications")
    .insert({
      application_id: applicationId,
      customer_id: customerId,
      overall_status: "draft",
      current_step: "insurance_quote",
      insurance_type: insuranceType || "car",
    })
    .select()
    .single();

  if (appError || !app) {
    console.error("[workflow] createApplication error:", appError);
    return null;
  }

  const stepRows = APPLICATION_STEPS.map((step) => ({
    application_id: app.id,
    step_key: step.key,
    title: step.title,
    step_order: step.order,
    status: step.order === 1 ? "draft" : "locked",
    locked: step.order !== 1,
    data: {},
  }));

  const { data: steps, error: stepsError } = await supabase
    .from("application_steps")
    .insert(stepRows)
    .select();

  if (stepsError || !steps) {
    console.error("[workflow] createApplication steps error:", stepsError);
    return null;
  }

  await supabase.from("application_history").insert({
    application_id: app.id,
    event_type: "application_created",
    actor: "customer",
    details: { application_id: applicationId, insurance_type: insuranceType },
  });

  storeApplicationId(applicationId);
  return { application: app as ApplicationRow, steps: steps as ApplicationStepRow[] };
}

export async function getApplication(applicationId: string): Promise<ApplicationWithSteps | null> {
  const { data: app, error } = await supabase
    .from("applications")
    .select("*")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (error || !app) return null;

  const { data: steps, error: stepsError } = await supabase
    .from("application_steps")
    .select("*")
    .eq("application_id", app.id)
    .order("step_order", { ascending: true });
  if (stepsError || !steps) return null;

  return { application: app as ApplicationRow, steps: steps as ApplicationStepRow[] };
}

export async function resumeApplication(): Promise<ApplicationWithSteps | null> {
  const storedId = getStoredApplicationId();
  if (!storedId) return null;
  return getApplication(storedId);
}

// ── Step submission ───────────────────────────────────────────
export async function submitStep(
  applicationId: string,
  stepKey: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const { data: app, error: appError } = await supabase
    .from("applications")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (appError || !app) return { success: false, error: "لم يتم العثور على الطلب" };

  const { data: step } = await supabase
    .from("application_steps")
    .select("id, status")
    .eq("application_id", app.id)
    .eq("step_key", stepKey)
    .maybeSingle();
  if (!step) return { success: false, error: "لم يتم العثور على الخطوة" };

  const isResubmission = step.status === "changes_requested" || step.status === "rejected";

  const { error: updateError } = await supabase
    .from("application_steps")
    .update({
      status: "submitted",
      data: data as never,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", step.id);
  if (updateError) return { success: false, error: "فشل حفظ البيانات" };

  const { data: versions } = await supabase
    .from("submission_versions")
    .select("version_number")
    .eq("step_id", step.id)
    .order("version_number", { ascending: false })
    .limit(1);
  const lastVersion = versions && versions.length > 0 ? versions[0]?.version_number : 0;
  const nextVersion = (lastVersion ?? 0) + 1;

  await supabase.from("submission_versions").insert({
    application_id: app.id,
    step_id: step.id,
    step_key: stepKey,
    version_number: nextVersion,
    data: data as never,
  });

  await supabase
    .from("applications")
    .update({
      overall_status: "under_review",
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", app.id);

  await supabase.from("application_history").insert({
    application_id: app.id,
    event_type: isResubmission ? "step_resubmitted" : "step_submitted",
    step_key: stepKey,
    actor: "customer",
    details: { version: nextVersion },
  });

  await supabase.from("notifications").insert({
    application_id: app.id,
    step_key: stepKey,
    type: "step_submitted",
    title: "تم إرسال الخطوة",
    message: `تم إرسال "${getStepByKey(stepKey)?.title || stepKey}" للمراجعة.`,
  });

  return { success: true };
}

export function canEditStep(step: ApplicationStepRow | null): boolean {
  if (!step) return false;
  if (step.locked) return false;
  return step.status === "draft" || step.status === "changes_requested" || step.status === "rejected";
}

// Convenience wrappers that read the active application from localStorage.
export async function submitCurrentStep(
  stepKey: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  const id = getStoredApplicationId();
  if (!id) return { success: false, error: "لا يوجد طلب نشط، ابدأ من جديد" };
  return submitStep(id, stepKey, data);
}

export async function setInsurer(companyName: string, priceSar: number): Promise<void> {
  const id = getStoredApplicationId();
  if (!id) return;
  const { data: app } = await supabase
    .from("applications")
    .select("id, metadata")
    .eq("application_id", id)
    .maybeSingle();
  if (!app) return;
  const meta = { ...(app.metadata as Record<string, unknown> ?? {}), insurer_company: companyName, insurer_offer_sar: priceSar };
  await supabase
    .from("applications")
    .update({
      metadata: meta as never,
      current_step: "insurer_selected",
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", app.id);
}

export async function updateCurrentStep(applicationId: string, stepKey: string): Promise<void> {
  const { data: app } = await supabase
    .from("applications")
    .select("id")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (!app) return;
  await supabase
    .from("applications")
    .update({
      current_step: stepKey,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", app.id);
}
