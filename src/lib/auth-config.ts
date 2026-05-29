export function isKimiOAuthConfigured(): boolean {
  const authUrl = import.meta.env.VITE_KIMI_AUTH_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();
  if (!authUrl || !appId) return false;
  try {
    new URL(authUrl);
    return true;
  } catch {
    return false;
  }
}

export function getKimiOAuthUrl(): string | null {
  if (!isKimiOAuthConfigured()) return null;

  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL.trim();
  const appID = import.meta.env.VITE_APP_ID.trim();
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}
