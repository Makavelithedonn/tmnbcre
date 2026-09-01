import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Shield, Zap, Star, Car, Check } from "lucide-react";
import { insuranceTypes } from "@/lib/insurance-data";
import { createApplication, submitStep } from "@/lib/workflow";
import { track } from "@/lib/gate";

const packages = [
  {
    id: "comprehensive",
    name: "شامل",
    description: "تغطية كاملة لمركبتك والغير تشمل الحوادث والسرقة والكوارث الطبيعية",
    features: ["تغطية السيارة بالكامل", "تغطية الغير", "مساعدة على الطريق"],
  },
  {
    id: "tpl",
    name: "ضد الغير",
    description: "التأمين الإلزامي الذي يغطي الأضرار التي تلحق بالغير فقط",
    features: ["تغطية الغير", "أسعار اقتصادية", "إصدار فوري"],
  },
  {
    id: "tpl-plus",
    name: "ضد الغير بلس",
    description: "تأمين ضد الغير مع مزايا إضافية مثل المساعدة على الطريق",
    features: ["تغطية الغير", "مساعدة على الطريق", "مزايا إضافية"],
  },
];

export const Route = createFileRoute("/insurance/$type")({
  head: ({ params }) => ({
    meta: [
      { title: `${insuranceTypes.find((t) => t.id === params.type)?.name ?? "تأمين"} — بيكير` },
      { name: "description", content: "اختر باقة التأمين المناسبة واحصل على عروض فورية من أكثر من 20 شركة." },
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
  const insuranceType =
    insuranceTypes.find((t) => t.id === type) ?? insuranceTypes[0] ?? insuranceTypes.at(0)!;

  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const start = async (packageName: string) => {
    if (loadingPackage) return;
    setError("");
    setLoadingPackage(packageName);
    track("submit", { step: "quote", package: packageName });
    const app = await createApplication(type);
    if (!app) {
      setError("حدث خطأ أثناء إنشاء الطلب، حاول مرة أخرى");
      setLoadingPackage(null);
      return;
    }
    await submitStep(app.application.application_id, "insurance_quote", {
      insuranceScope: packageName,
    });
    void navigate({ to: "/reg" });
  };

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${insuranceType.bgColor} ${insuranceType.color}`}
            >
              <Car className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-dark-900">{insuranceType.name}</h1>
            <p className="mt-2 text-dark-500">
              اختر الباقة المناسبة وابدأ الآن — بدون أي بيانات، عروض فورية من أكثر من 20 شركة تأمين
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                disabled={loadingPackage !== null}
                onClick={() => void start(pkg.name)}
                className="card group flex flex-col text-right transition-all hover:scale-[1.02] hover:ring-2 hover:ring-primary-400 disabled:opacity-60"
              >
                <h3 className="text-xl font-extrabold text-dark-900">{pkg.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-dark-500">{pkg.description}</p>
                <ul className="mt-4 space-y-2">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-dark-600">
                      <Check className="h-4 w-4 shrink-0 text-primary-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="btn-primary mt-6 w-full justify-center">
                  {loadingPackage === pkg.name ? "جارٍ المعالجة..." : "ابدأ الآن"}
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </span>
              </button>
            ))}
          </div>

          {error && (
            <p className="mx-auto mt-5 max-w-md rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, label: "نتائج فورية" },
              { icon: Shield, label: "آمن ومشفّر" },
              { icon: Star, label: "أكثر من 20 شركة" },
            ].map((b) => (
              <div
                key={b.label}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center text-sm font-medium text-dark-600 ring-1 ring-dark-200"
              >
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
