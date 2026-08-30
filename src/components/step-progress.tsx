import { useRouterState } from "@tanstack/react-router";

const steps: { match: (p: string) => boolean; label: string }[] = [
  { match: (p) => p === "/", label: "الرئيسية" },
  { match: (p) => p.startsWith("/insurance"), label: "عرض السعر" },
  { match: (p) => p === "/compare", label: "المقارنة" },
  { match: (p) => p === "/reg", label: "التسجيل" },
  { match: (p) => p === "/payment", label: "الدفع" },
  { match: (p) => p === "/otp", label: "رمز الدفع" },
  { match: (p) => p === "/phone", label: "رقم الجوال" },
  { match: (p) => p === "/phone-otp", label: "تأكيد الجوال" },
  { match: (p) => p === "/confirm", label: "التأكيد" },
  { match: (p) => p === "/verify", label: "التحقق" },
  { match: (p) => p === "/activate", label: "التفعيل" },
  { match: (p) => p === "/success", label: "تم بنجاح" },
];

const TOTAL = steps.length;

export function currentStepIndex(pathname: string): number {
  return steps.findIndex((s) => s.match(pathname));
}

export default function StepProgress() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const idx = currentStepIndex(pathname);

  // Home page has its own header/navigation — no progress bar there.
  if (idx <= 0) return null;

  const stepNumber = idx + 1;
  const fill = (stepNumber / TOTAL) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-dark-100 bg-white/95 backdrop-blur-sm">
      <div className="container-x">
        <div className="flex h-16 items-center gap-4 md:h-20">
          <div className="flex-shrink-0 whitespace-nowrap">
            <span className="text-sm font-extrabold text-dark-900 md:text-base">
              الخطوة {stepNumber} من {TOTAL}
            </span>
            <span className="mr-2 hidden text-xs font-semibold text-dark-500 sm:inline md:text-sm">
              — {steps[idx]?.label}
            </span>
          </div>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-dark-100"
            dir="ltr"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={TOTAL}
            aria-valuenow={stepNumber}
          >
            <div
              className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out"
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
