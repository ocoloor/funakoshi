import { crypto, toHashString } from "std/crypto/mod.ts";

type MemberJoinedChannelEvent = {
  type: "member_joined_channel";
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  inviter: string;
  event_ts: string;
};
type MemberLeftChannelEvent = {
  type: "member_left_channel";
  user: string;
  channel: string;
  channel_type: string;
  team: string;
  event_ts: string;
};

export const isMemberJoinedChannelEvent = (
  event: unknown,
): event is MemberJoinedChannelEvent => {
  return typeof event === "object" && event !== null &&
    "type" in event && event.type === "member_joined_channel";
};

export const isMemberLeftChannelEvent = (
  event: unknown,
): event is MemberLeftChannelEvent => {
  return typeof event === "object" && event !== null && "type" in event &&
    event.type === "member_left_channel";
};

/**
 * Verify request from Slack
 *
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export const verifyRequest = async (
  req: Request,
  { signingSecret }: { signingSecret: string },
) => {
  const body = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp");
  if (Date.now() / 1000 - Number(timestamp) > 60 * 5) {
    // The request timestamp is more than five minutes from local time.
    // It could be a replay attack, so let's ignore it.
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBaseString = `v0:${timestamp}:${body}`;
  const signature = await crypto.subtle.sign(
    { name: "HMAC" },
    key,
    new TextEncoder().encode(sigBaseString),
  );
  const hash = `v0=${toHashString(signature)}`;
  const slackSignature = req.headers.get("x-slack-signature");
  return hash === slackSignature;
};

/**
 * Execute Channel Management Webhook on the Slack Next-Gen Platform
 */
export const executeWebhook = async (
  event: MemberJoinedChannelEvent | MemberLeftChannelEvent,
  { botUserId, botChannelManagementWebhookUrl }: {
    botUserId: string;
    botChannelManagementWebhookUrl: string;
  },
) => {
  if (event.user === botUserId) {
    const res = await fetch(
      botChannelManagementWebhookUrl,
      { method: "POST" },
    );
    if (!res.ok) {
      throw new Error(
        `fetch botChannelManagementWebhookUrl failed: ${res.statusText}`,
      );
    }
  }
};
