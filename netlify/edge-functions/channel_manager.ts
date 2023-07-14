import {
  executeWebhook,
  isMemberJoinedChannelEvent,
  isMemberLeftChannelEvent,
  verifyRequest,
} from "../../channel_manager/mod.ts";

const BOT_CHANNEL_MANAGEMENT_WEBHOOK_URL = Deno.env.get(
  "CHANNEL_MANAGER_TARGET_BOT_CHANNEL_MANAGEMENT_WEBHOOK_URL",
);
const BOT_USER_ID = Deno.env.get("CHANNEL_MANAGER_TARGET_BOT_USER_ID");
const SLACK_SIGNING_SECRET = Deno.env.get(
  "CHANNEL_MANAGER_SLACK_SIGNING_SECRET",
);

export default async (req: Request) => {
  if (req.headers.get("content-type") !== "application/json") {
    return new Response("Invalid Content-Type", { status: 400 });
  }
  if (!SLACK_SIGNING_SECRET) {
    return new Response("SLACK_SIGNING_SECRET not set", { status: 500 });
  } else if (!BOT_CHANNEL_MANAGEMENT_WEBHOOK_URL) {
    return new Response("BOT_CHANNEL_MANAGEMENT_WEBHOOK_URL not set", {
      status: 500,
    });
  } else if (!BOT_USER_ID) {
    return new Response("BOT_USER_ID not set", { status: 500 });
  }
  const verified = await verifyRequest(req.clone(), {
    signingSecret: SLACK_SIGNING_SECRET,
  });
  if (!verified) {
    return new Response("Invalid Signature", { status: 400 });
  }
  const body = await req.json();
  switch (body.type) {
    case "url_verification":
      return new Response(body.challenge, { status: 200 });
    case "event_callback": {
      const { event } = body;
      if (
        isMemberJoinedChannelEvent(event) || isMemberLeftChannelEvent(event)
      ) {
        try {
          await executeWebhook(event, {
            botChannelManagementWebhookUrl: BOT_CHANNEL_MANAGEMENT_WEBHOOK_URL,
            botUserId: BOT_USER_ID,
          });
        } catch (err) {
          console.log("executeWebhook failed", err);
        }
        return new Response();
      }
      console.log("unsupported event type", body.event.type);
      return new Response();
    }
    default:
      console.log("unsupported body type", body.type);
      return new Response();
  }
};
