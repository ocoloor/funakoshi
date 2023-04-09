import { createMentionCommand } from "gbas/mod.ts";
import { authorize, searchTracks } from "./api.ts";

export const spotify = createMentionCommand({
  name: "spotify",
  examples: ["spotify <query> - Spotifyで曲を検索する"],
  pattern: /^spotify\s+(.+)$/i,
  execute: async (c) => {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = c.env;
    if (
      SPOTIFY_CLIENT_ID === undefined || SPOTIFY_CLIENT_SECRET === undefined
    ) {
      return c.res.message(
        "SPOTIFY_CLIENT_IDまたはSPOTIFY_CLIENT_SECRETが設定されていないぞ",
      );
    }
    const resAuth = await authorize({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
    });
    if (!resAuth.ok) {
      return c.res.message(
        `認証に失敗したぞ: \`${JSON.stringify(resAuth.error)}\``,
      );
    }
    const { access_token: accessToken } = resAuth.value;
    const query = c.match[1];
    const resSearch = await searchTracks({ accessToken, query });
    if (!resSearch.ok) {
      return c.res.message(
        `検索に失敗したぞ: \`${JSON.stringify(resSearch.error)}\``,
      );
    }
    const { items } = resSearch.value;
    if (!items.length) {
      return c.res.message(`曲が見つからなかったぞ: \`${c.match[1]}\``);
    }
    return c.res.message(c.randomChoice(items).external_urls.spotify);
  },
  outgoingDomains: ["accounts.spotify.com", "api.spotify.com"],
});
