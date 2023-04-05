import { Trigger } from "deno-slack-api/types.ts";
import { botScheduledMaintenanceWorkflow } from "../workflows/bot_scheduled_maintenance.ts";
import { BOT_SCHEDULED_MAINTENANCE_TRIGGER } from "../bot/management.ts";

const botScheduledMaintenanceTrigger: Trigger<
  typeof botScheduledMaintenanceWorkflow.definition
> = BOT_SCHEDULED_MAINTENANCE_TRIGGER;
export default botScheduledMaintenanceTrigger;
