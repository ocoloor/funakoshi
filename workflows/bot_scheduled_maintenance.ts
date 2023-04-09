import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { BOT_SCHEDULED_MAINTENANCE_WORKFLOW_ID } from "../bot/management.ts";
import { refreshAllTriggers } from "../functions/bot/refresh_all_triggers.ts";

export const botScheduledMaintenanceWorkflow = DefineWorkflow({
  callback_id: BOT_SCHEDULED_MAINTENANCE_WORKFLOW_ID,
  title: "Bot scheduled maintenance workflow",
  input_parameters: {
    properties: {},
    required: [],
  },
});

botScheduledMaintenanceWorkflow.addStep(refreshAllTriggers, {});
