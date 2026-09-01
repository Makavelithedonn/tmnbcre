// useRouteTracking.ts - React hook for automatic route tracking
import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { trackPageView, setupFormTracking } from "@/lib/tracker";

export function useRouteTracking(): void {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route change
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    // Setup form tracking on mount
    setupFormTracking();
  }, []);
}
