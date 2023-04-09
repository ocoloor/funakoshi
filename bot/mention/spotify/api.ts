type SpotifyTokenResponse = {
  ok: false;
  error: Record<string, unknown>;
} | {
  ok: true;
  value: { access_token: string; token_type: string; expires_in: number };
};

type SpotifyTrack = Record<string, unknown> & {
  external_urls: { spotify: string };
};
type SpotifySearchResponse = {
  ok: false;
  error: Record<string, unknown>;
} | {
  ok: true;
  value: { items: SpotifyTrack[] };
};

export const authorize = async (
  { clientId, clientSecret }: { clientId: string; clientSecret: string },
): Promise<SpotifyTokenResponse> => {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(clientId + ":" + clientSecret)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!res.ok) {
    return { error: await res.json(), ok: false };
  }
  return { value: await res.json(), ok: true };
};

export const searchTracks = async (
  { accessToken, query }: { accessToken: string; query: string },
): Promise<SpotifySearchResponse> => {
  const res = await fetch(
    `https://api.spotify.com/v1/search?${new URLSearchParams({
      q: query,
      type: "track",
      limit: "5",
    })}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) {
    return { error: await res.json(), ok: false };
  }
  const { items = [] } = (await res.json()).tracks;
  return { value: { items }, ok: true };
};
