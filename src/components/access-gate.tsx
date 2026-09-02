import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getVisitorCountry } from "@/lib/geo.functions";

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua);
  const coarse = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
  const narrow = typeof window !== "undefined" && window.innerWidth <= 1024;
  return uaMobile || (Boolean(coarse) && narrow);
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        role="status"
        aria-label="جاري التحميل"
        className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"
      />
    </div>
  );
}

/**
 * Allows the app to run only for mobile devices located in Saudi Arabia.
 * Everyone else stays on an endless loading screen.
 */
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [mobile, setMobile] = useState(false);
  const fetchCountry = useServerFn(getVisitorCountry);

  useEffect(() => {
    setMobile(isMobileDevice());
    setMounted(true);
  }, []);

  const { data, isPending } = useQuery({
    queryKey: ["visitor-country"],
    queryFn: () => fetchCountry({}),
    staleTime: Infinity,
    retry: false,
    enabled: mounted && mobile,
  });

  if (!mounted || !mobile) return <LoadingScreen />;
  if (isPending) return <LoadingScreen />;

  const country = data?.country ?? null;
  // Unknown country (e.g. local/preview environments) is treated as allowed.
  if (country !== null && country !== "SA") return <LoadingScreen />;

  return <>{children}</>;
}
