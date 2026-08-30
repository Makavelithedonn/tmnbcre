import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Shield, Zap, Star, Car } from "lucide-react";
import { insuranceTypes, insuranceCompanies, carBrands, saudiCities } from "@/lib/insurance-data";
import { createApplication, submitStep } from "@/lib/workflow";

export const Route = createFileRoute("/insurance/$type")({
  head: ({ params }) => ({
    meta: [
      { title: `${insuranceTypes.find((t) => t.id === params.type)?.name ?? "تأمين"} — بيكير` },
      { name: "description", content: "أدخل بياناتك للحصول على عروض تأمين فورية من أكثر من 20 شركة." },
      { property: "og:title", content: "تأمين — بيكير" },
      { property: "og:description", content: "عروض تأمين فورية من أكثر من 20 شركة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsuranceQuotePage,
});

function InsuranceQuotePage() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const insuranceType = insuranceTypes.find((t) => t.id === type) ?? insuranceTypes[0] ?? insuranceTypes.at(0)!;

  const [form, setForm] = useState({
    nationalId: "",
    phone: "",
    carBrand: "",
    carModel: "",
    carYear: "",
    city: "",
    insuranceScope: "شامل",
    declaredValue: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [captcha, setCaptcha] = useState(() => ({
    a: Math.floor(Math.random() * 9) + 1,
    b: Math.floor(Math.random() * 9) + 1,
  }));
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
  };

  // Saudi national ID starts with 1, Iqama with 2 — always 10 digits.
  const validateNationalId = (v: string) =>
    /^[12]\d{9}$/.test(v) ? "" : "رقم الهوية/الإقامة يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
  const validatePhone = (v: string) =>
    /^05\d{8}$/.test(v) ? "" : "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";

  const refreshCaptcha = () => {
    setCaptcha({ a: Math.floor(Math.random() * 9) + 1, b: Math.floor(Math.random() * 9) + 1 });
    setCaptchaAnswer("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {
      nationalId: validateNationalId(form.nationalId),
      phone: validatePhone(form.phone),
      captcha: Number(captchaAnswer) === captcha.a + captcha.b ? "" : "الإجابة غير صحيحة",
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      if (errors["captcha"]) refreshCaptcha();
      return;
    }
    setLoading(true);
    const app = await createApplication(type);
    if (!app) {
      setError("حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى");
      setLoading(false);
      return;
    }
    const submit = await submitStep(app.application.application_id, "insurance_quote", form);
    if (!submit.success) {
      setError(submit.error || "حدث خطأ، حاول مرة أخرى");
      setLoading(false);
      return;
    }
    setLoading(false);
    void navigate({ to: "/compare" });
  };


  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${insuranceType.bgColor} ${insuranceType.color}`}>
              <Car className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-dark-900">{insuranceType.name}</h1>
            <p className="mt-2 text-dark-500">أدخل بياناتك للحصول على عروض فورية من أكثر من 20 شركة تأمين</p>
          </div>

          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${s === 1 ? "bg-primary-600 text-white" : "bg-dark-200 text-dark-500"}`}>
                  {s === 1 ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < 3 && <div className="h-0.5 w-12 bg-dark-200" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                <label className="mb-1.5 block text-sm font-medium text-dark-700">ماركة السيارة</label>
                <select value={form.carBrand} onChange={(e) => update("carBrand", e.target.value)} required className="input-field">
                  <option value="">اختر الماركة</option>
                  {carBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">الموديل</label>
                <input value={form.carModel} onChange={(e) => update("carModel", e.target.value)} required className="input-field" placeholder="مثال: كامري" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">سنة الموديل</label>
                <select value={form.carYear} onChange={(e) => update("carYear", e.target.value)} required className="input-field">
                  <option value="">اختر السنة</option>
                  {Array.from({ length: 15 }, (_, i) => 2024 - i).map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">المدينة</label>
                <select value={form.city} onChange={(e) => update("city", e.target.value)} required className="input-field">
                  <option value="">اختر المدينة</option>
                  {saudiCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">نوع التأمين</label>
                <select value={form.insuranceScope} onChange={(e) => update("insuranceScope", e.target.value)} className="input-field">
                  <option value="شامل">شامل</option>
                  <option value="ضد الغير">ضد الغير</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">القيمة المقدرة (ريال)</label>
                <input value={form.declaredValue} onChange={(e) => update("declaredValue", e.target.value)} required className="input-field" placeholder="مثال: 80000" inputMode="numeric" />
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

            <div className="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
              <Shield className="h-5 w-5" />
              بياناتك آمنة ومشفرة، ولن تُستخدم إلا لغرض التسعير
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جارٍ المعالجة..." : "مقارنة العروض"}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "نتائج فورية" },
              { icon: Shield, label: "آمن ومشفّر" },
              { icon: Star, label: "أكثر من 20 شركة" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center text-sm font-medium text-dark-600 ring-1 ring-dark-200">
                <b.icon className="h-5 w-5 text-primary-600" />
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
