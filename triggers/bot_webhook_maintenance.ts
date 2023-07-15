import { Trigger } from "deno-slack-api/types.ts";
import { botWebhookMaintenanceWorkflow } from "../workflows/bot_webhook_maintenance.ts";

const botConfigurationModalTrigger: Trigger<
  typeof botWebhookMaintenanceWorkflow.definition
> = {
  type: "webhook",
  name: "Bot Webhook Maintenance Trigger",
  description: "Webhook経由でfunakoshiの設定を更新します",
  workflow:
    `#/workflows/${botWebhookMaintenanceWorkflow.definition.callback_id}`,
  inputs: {},
};
export default botConfigurationModalTrigger;
