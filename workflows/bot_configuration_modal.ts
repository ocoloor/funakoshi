import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { ConfigureAllTriggersInModalFunctionDef } from "../functions/bot/configure_all_triggers_in_modal.ts";

export const botConfigurationModalWorkflow = DefineWorkflow({
  callback_id: "bot_configuration_modal_workflow",
  title: "Bot configuration in modal workflow",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
});

botConfigurationModalWorkflow.addStep(ConfigureAllTriggersInModalFunctionDef, {
  interactivity: botConfigurationModalWorkflow.inputs.interactivity,
});
