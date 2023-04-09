import { SlackAPIClient, Trigger } from "deno-slack-api/types.ts";

// this type is that referenced actual API response
type ChannelResource = {
  id: string;
  name: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  is_mpim: boolean;
  is_private: boolean;
  created: number;
  is_archived: boolean;
  is_general: boolean;
  unlinked: number;
  name_normalized: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_pending_ext_shared: boolean;
  pending_shared: unknown[];
  context_team_id: string;
  updated: number;
  parent_conversation: null | unknown;
  creator: string;
  is_ext_shared: boolean;
  shared_team_ids: string[];
  pending_connected_team_ids: string[];
  is_member: boolean;
  topic: { value: string; creator: string; last_set: number };
  purpose: {
    value: string;
    creator: string;
    last_set: number;
  };
  previous_names: string[];
  num_members: number;
};

export const findRegisteredTrigger = async (
  { client, trigger }: {
    client: SlackAPIClient;
    trigger: Trigger;
  },
): Promise<{ channelIds: string[]; id: string } | undefined> => {
  const res = await client.workflows.triggers.list({ is_owner: true });
  if (!res.ok) {
    throw new Error("client.workflows.triggers.list failed", {
      cause: res.error,
    });
  }
  const workflowCallbackId = trigger.workflow.replace("#/workflows/", "");
  const registeredTrigger = res.triggers.find((val) => {
    return val.workflow.callback_id === workflowCallbackId;
  });
  return registeredTrigger &&
    { channelIds: registeredTrigger.channel_ids, id: registeredTrigger.id };
};

export const createOrUpdateScheduledTrigger = async (
  { client, trigger, triggerId }: {
    client: SlackAPIClient;
    trigger: Trigger;
    triggerId?: string;
  },
) => {
  if (triggerId) {
    const res = await client.workflows.triggers.update({
      ...trigger,
      trigger_id: triggerId,
    });
    if (!res.ok) {
      throw new Error("client.workflows.triggers.update failed", {
        cause: res.error,
      });
    }
    return;
  }
  const res = await client.workflows.triggers.create({ ...trigger });
  if (!res.ok) {
    throw new Error("client.workflows.triggers.create failed", {
      cause: res.error,
    });
  }
};

export const createOrUpdateEventTrigger = async (
  { client, trigger, triggerId, channelIds }: {
    client: SlackAPIClient;
    trigger: Trigger;
    channelIds?: string[];
    triggerId?: string;
  },
) => {
  if (triggerId) {
    const res = await client.workflows.triggers.update({
      ...trigger,
      // deno-lint-ignore no-explicit-any
      type: trigger.type as any,
      // deno-lint-ignore no-explicit-any
      workflow: trigger.workflow as any,
      event: {
        ...trigger.event,
        // deno-lint-ignore no-explicit-any
        ...(channelIds && { channel_ids: channelIds as any }),
      },
      trigger_id: triggerId,
    });
    if (!res.ok) {
      throw new Error("client.workflows.triggers.update failed", {
        cause: res.error,
      });
    }
    return;
  }
  const res = await client.workflows.triggers.create({
    ...trigger,
    // deno-lint-ignore no-explicit-any
    type: trigger.type as any,
    // deno-lint-ignore no-explicit-any
    workflow: trigger.workflow as any,
    event: {
      ...trigger.event,
      // deno-lint-ignore no-explicit-any
      ...(channelIds && { channel_ids: channelIds as any }),
    },
  });
  if (!res.ok) {
    throw new Error("client.workflows.triggers.create failed", {
      cause: res.error,
    });
  }
};

export const setupEventTriggers = async (
  { channelIds, client, triggers }: {
    channelIds?: string[];
    client: SlackAPIClient;
    triggers: Trigger[];
  },
) => {
  for (const trigger of triggers) {
    const triggerId = (await findRegisteredTrigger({
      client,
      trigger,
    }))?.id;
    await createOrUpdateEventTrigger({
      client,
      trigger,
      channelIds,
      triggerId,
    });
  }
};

export const setupScheduledTriggers = async (
  { client, triggers }: {
    client: SlackAPIClient;
    triggers: Trigger[];
  },
) => {
  for (const trigger of triggers) {
    const triggerId = (await findRegisteredTrigger({
      client,
      trigger,
    }))?.id;
    await createOrUpdateScheduledTrigger({
      client,
      trigger,
      triggerId,
    });
  }
};

export const getAllPublicNoSharedChannels = async (
  { client }: { client: SlackAPIClient },
): Promise<ChannelResource[]> => {
  let channels: ChannelResource[] = [];
  let cursor = null;
  while (cursor === null || cursor) {
    const params: NonNullable<Parameters<typeof client.conversations.list>[0]> =
      {
        exclude_archived: true,
        types: "public_channel",
        ...(cursor && { cursor }),
      };
    const res = await client.conversations.list(params);
    if (!res.ok) {
      throw new Error("client.conversations.list failed", { cause: res.error });
    }
    channels = [...channels, ...res.channels as ChannelResource[]];
    cursor = res.response_metadata?.next_cursor;
  }
  return channels.filter((c) => !c.is_shared);
};

export const getJoinedPublicNoSharedChannels = async (
  { client }: { client: SlackAPIClient },
) => {
  const channels = await getAllPublicNoSharedChannels({ client });
  return channels.filter((c) => c.is_member);
};
