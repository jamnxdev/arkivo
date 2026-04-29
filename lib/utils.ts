import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// TODO: Keep this fallback in sync with the deployed canonical domain.
const DEFAULT_PRODUCTION_SITE_URL = "https://arkivo.jamnx.com";
const DEFAULT_DEVELOPMENT_SITE_URL = "http://localhost:3000";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL;
  const fallbackUrl =
    process.env.NODE_ENV === "production"
      ? DEFAULT_PRODUCTION_SITE_URL
      : DEFAULT_DEVELOPMENT_SITE_URL;

  return trimTrailingSlash(configuredUrl ?? fallbackUrl);
}
