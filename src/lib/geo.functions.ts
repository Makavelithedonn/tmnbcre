import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Returns the visitor's country code as reported by the edge/CDN layer.
 * "SA" = Saudi Arabia. Returns null when the country can't be determined.
 */
export const getVisitorCountry = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest();
  const h = request.headers;
  const country =
    h.get("cf-ipcountry") ??
    h.get("x-vercel-ip-country") ??
    h.get("x-country-code") ??
    h.get("x-geo-country") ??
    null;

  return { country: country ? country.toUpperCase() : null };
});
