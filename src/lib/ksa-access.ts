const LOCATION_URL = "https://ipwho.is/";
const CACHE_KEY = "bc_country_code";

type LocationResponse = {
  success?: boolean;
  country_code?: string;
};

export type KsaAccessResult = "allowed" | "outside_ksa" | "unavailable";

export async function checkKsaAccess(): Promise<KsaAccessResult> {
  const cachedCountry = sessionStorage.getItem(CACHE_KEY);
  if (cachedCountry) return cachedCountry === "SA" ? "allowed" : "outside_ksa";

  try {
    const response = await fetch(LOCATION_URL, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return "unavailable";

    const location = (await response.json()) as LocationResponse;
    const countryCode = location.country_code?.toUpperCase();
    if (!location.success || !countryCode) return "unavailable";

    sessionStorage.setItem(CACHE_KEY, countryCode);
    return countryCode === "SA" ? "allowed" : "outside_ksa";
  } catch {
    return "unavailable";
  }
}