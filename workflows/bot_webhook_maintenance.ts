import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { refreshAllTriggers } from "../functions/bot/refresh_all_triggers.ts";

export const botWebhookMaintenanceWorkflow = DefineWorkflow({
  callback_id: "bot_webhook_maintenance_workflow",
  title: "Bot webhook maintenance workflow",
  input_parameters: {
    properties: {},
    required: [],
  },
});

botWebhookMaintenanceWorkflow.addStep(refreshAllTriggers, {});
