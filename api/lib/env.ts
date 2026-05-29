import "dotenv/config";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

function optionalUrl(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    console.warn(`[env] Ignoring invalid ${name}: ${value}`);
    return "";
  }
}

const isProduction = process.env.NODE_ENV === "production";
const kimiAuthUrl = optionalUrl("KIMI_AUTH_URL");
const kimiOpenUrl = optionalUrl("KIMI_OPEN_URL");

const rawDatabaseUrl = process.env.DATABASE_URL?.trim() ?? "";
/** Use JSON file at .data/dev-store.json instead of MySQL (local dev only). */
const useDevStore =
  !isProduction &&
  (rawDatabaseUrl === "" ||
    rawDatabaseUrl === "dev" ||
    rawDatabaseUrl === "file:dev" ||
    process.env.USE_DEV_STORE === "true");

export const env = {
  appId: required("APP_ID") || "dev-app",
  appSecret:
    required("APP_SECRET") || "dev-only-secret-do-not-use-in-production",
  isProduction,
  useDevStore,
  databaseUrl: useDevStore ? "" : rawDatabaseUrl,
  kimiAuthUrl,
  kimiOpenUrl,
  kimiEnabled: Boolean(kimiAuthUrl && kimiOpenUrl),
  allowDevAuth: !isProduction && !(kimiAuthUrl && kimiOpenUrl),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
};

if (!isProduction) {
  if (env.useDevStore) {
    console.info(
      "[env] Dev file store enabled (.data/dev-store.json) — set DATABASE_URL=dev in .env",
    );
  }
  if (env.allowDevAuth) {
    console.info("[env] Dev login: GET /api/dev/login");
  } else if (env.kimiEnabled) {
    console.info("[env] Kimi OAuth enabled");
  }
}
