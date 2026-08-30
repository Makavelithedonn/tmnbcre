import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Star, Shield, Zap, TrendingDown, Crown } from "lucide-react";
import { insuranceCompanies } from "@/lib/insurance-data";
import { setInsurer, submitCurrentStep } from "@/lib/workflow";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقارنة العروض — بيكير" },
      { name: "description", content: "قارن عروض تأمين السيارات من أكثر من 20 شركة واختر الأنسب لك." },
      { property: "og:title", content: "مقارنة العروض — بيكير" },
      { property: "og:description", content: "قارن عروض تأمين السيارات واختر الأنسب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

type Offer = {
  companyId: string;
  companyName: string;
  color: string;
  price: number;
  rating: number;
  features: string[];
};

function generateOffers(declaredValue: number): Offer[] {
  const base = Math.max(declaredValue || 80000, 80000);
  return insuranceCompanies.map((c, i) => {
    const factor = 0.012 + (i % 5) * 0.0008 + (c.id.length % 3) * 0.0005;
    return {
      companyId: c.id,
      companyName: c.name,
      color: c.color,
      price: Math.round((base * factor) / 10) * 10,
      rating: 4 + ((i * 7) % 10) / 10,
      features: [
        "إصدار فوري",
        "ربط مباشر بنجم",
        i % 2 === 0 ? "وكيل مجاني" : "خصم 10% للقطاع الحكومي",
        i % 3 === 0 ? "ساعات أخذر مجانية" : "تغطية الإيجار",
      ],
    };
  });
}

function ComparePage() {
  const navigate = useNavigate();
  const [sort, setSort] = useState<"price" | "rating">("price");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const offers = generateOffers(80000).sort((a, b) =>
    sort === "price" ? a.price - b.price : b.rating - a.rating,
  );

  const handleSelect = async () => {
    if (!selectedId) return;
    setLoading(true);
    const offer = offers.find((o) => o.companyId === selectedId);
    if (offer) await setInsurer(offer.companyName, offer.price);
    await submitCurrentStep("insurer_selected", {
      insurer_company: offer?.companyName,
      insurer_offer_sar: offer?.price,
    }).catch(() => {});
    setLoading(false);
    void navigate({ to: "/reg" });
  };

  return (
    <div className="min-h-screen bg-dark-50 pt-16 md:pt-20">
      <div className="container-x py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-extrabold text-dark-900">مقارنة العروض</h1>
            <p className="mt-2 text-dark-500">اختر العرض الأنسب لك من بين {offers.length} عرض</p>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-dark-500">{offers.length} عرض متاح</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-500">ترتيب:</span>
              <button
                onClick={() => setSort("price")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${sort === "price" ? "bg-primary-600 text-white" : "bg-white text-dark-600 ring-1 ring-dark-200"}`}
              >
                الأرخص
              </button>
              <button
                onClick={() => setSort("rating")}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${sort === "rating" ? "bg-primary-600 text-white" : "bg-white text-dark-600 ring-1 ring-dark-200"}`}
              >
                الأعلى تقييماً
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {offers.map((offer, idx) => {
              const isSelected = selectedId === offer.companyId;
              const isBest = idx === 0;
              return (
                <div
                  key={offer.companyId}
                  onClick={() => setSelectedId(offer.companyId)}
                  className={`cursor-pointer rounded-2xl border-2 bg-white p-5 transition-all ${
                    isSelected ? "border-primary-500 shadow-lg" : "border-dark-200 hover:border-primary-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white" style={{ backgroundColor: offer.color }}>
                        {offer.companyName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-dark-900">{offer.companyName}</h3>
                          {isBest && (
                            <span className="flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">
                              <Crown className="h-3 w-3" /> الأرخص
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.round(offer.rating) ? "fill-accent-400 text-accent-400" : "text-dark-300"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-dark-500">{offer.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-extrabold text-primary-700">{offer.price.toLocaleString()}</div>
                      <div className="text-sm text-dark-500">ريال / سنوي</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {offer.features.map((f) => (
                      <span key={f} className="rounded-lg bg-dark-50 px-3 py-1 text-xs font-medium text-dark-600">
                        <Check className="mr-1 inline h-3 w-3 text-green-500" />
                        {f}
                      </span>
                    ))}
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary-700">
                      <Check className="h-4 w-4" />
                      تم اختيار هذا العرض
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSelect}
            disabled={!selectedId || loading}
            className="btn-primary mt-6 w-full disabled:opacity-50"
          >
            {loading ? "جارٍ المتابعة..." : "متابعة التسجيل"}
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
