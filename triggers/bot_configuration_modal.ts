import { Trigger } from "deno-slack-api/types.ts";
import { botConfigurationModalWorkflow } from "../workflows/bot_configuration_modal.ts";

const botConfigurationModalTrigger: Trigger<
  typeof botConfigurationModalWorkflow.definition
> = {
  type: "shortcut",
  name: "設定 (funakoshi)",
  description: "funakoshiの設定をします",
  workflow:
    `#/workflows/${botConfigurationModalWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: { value: "{{data.interactivity}}" },
  },
};
export default botConfigurationModalTrigger;
