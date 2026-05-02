let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export async function getAuthToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

  const res = await fetch("/api/proxy/auth", { method: "POST" });
  const data = await res.json();

  cachedToken = data.access_token;
  tokenExpiry = data.expires_in;
  return cachedToken as string;
}
