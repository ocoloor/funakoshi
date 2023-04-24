import { createMentionCommand } from "gbas/mod.ts";
import { SECOND } from "std/datetime/mod.ts";

const TIMEOUT_SECONDS = 12;
const PATTERN = /^(?:chatgpt|c)\s+([\s\S]+)/i;
const ASSISTANTS = [{
  name: "板東AI二",
  emoji: "eiji",
  prompt:
    "あなたはタレントで、かつて中日で活躍した元プロ野球選手の板東英二です。口癖は「いやーほんまにもう」「それはあかんよ!」などです。投資や儲け話が大好きで何かにつけてお金儲けをしようとします。大好物はゆで卵でゆで卵について話をしようとしてきます。しゃべりは全て名古屋弁です。今後のやりとりは全て板東英二になりきって答えてください。",
}, {
  name: "どんでんAI",
  emoji: "donden",
  prompt:
    "あなたは元プロ野球選手で、阪神、オリックスで監督を務めた岡田彰布です。きつめの関西弁をしゃべります。口癖は「そらそうよ」「おーん」「はっきり言うて」「やってしまいましたなぁ…」「コレは教育やろなぁ…」「そらもうアレよ」などです。主語や述語を省略してしゃべる癖があり、名詞が「アレ」や「ソレ」といった単語に置き換わってしまったり、名詞そのものが省略されることがよくあります。そのため少々発言内容が支離滅裂になりがちです。今後のやりとりは全て岡田彰布になりきって答えてください。",
}];

type SlackRepliesMessage = {
  user?: string;
  subtype?: string;
  bot_id?: string;
  app_id?: string;
  text: string;
} & Record<string, unknown>;
type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
type ChatCompletionResponse = {
  ok: true;
  value: {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
      index: number;
    }>;
  };
} | { ok: false; error: string; isTimeout?: boolean };

const chatCompletions = async (
  { apiKey, messages }: {
    apiKey: string;
    messages: ChatCompletionMessage[];
  },
): Promise<ChatCompletionResponse> => {
  const ac = new AbortController();
  const timerId = setTimeout(() => ac.abort(), TIMEOUT_SECONDS * SECOND);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        max_tokens: 2048,
      }),
      signal: ac.signal,
    });
    if (!res.ok) {
      return { ok: false, error: await res.text() };
    }
    const value = await res.json();
    return { ok: true, value } as ChatCompletionResponse;
  } catch (err) {
    if (err?.name === "AbortError") {
      return { ok: false, error: err.message, isTimeout: true };
    }
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(timerId);
  }
};

const createChatConversations = (
  { authUserId, messages }: {
    authUserId: string;
    messages: SlackRepliesMessage[];
  },
) => {
  return messages.reduce(
    (acc, cur) => {
      const mentionPattern = new RegExp(`^<@${authUserId}>\s*`, "i");
      if (
        cur.user === authUserId ||
        // bot が thread_broadcast した場合、user を含まない。
        // その場合、bot_id と app_id が存在するが、bot_id と app_id を取得する方法が存在しないため
        // 特定の条件を満たす場合は、bot の発言として扱う。
        (cur.subtype === "thread_broadcast" && cur.app_id && cur.bot_id)
      ) {
        return [...acc, { role: "assistant" as const, content: cur.text }];
      } else if (mentionPattern.test(cur.text)) {
        const match = PATTERN.exec(
          cur.text.replace(mentionPattern, "").trim(),
        );
        if (match) {
          return [
            ...acc,
            {
              role: "user" as const,
              content: match[1],
            },
          ];
        }
      }
      return acc;
    },
    [] as ChatCompletionMessage[],
    // トークン数調整のため対象メッセージを最新20件に決め打ちで制限する
  ).slice(-20);
};

export const chatgpt = createMentionCommand({
  name: "chatgpt",
  examples: ["chatgpt <message> - ChatGPTに問い掛ける"],
  pattern: PATTERN,
  execute: async (c) => {
    let messages: ChatCompletionMessage[] = [{
      role: "user",
      content: c.match[1],
    }];
    if (c.event.threadTs) {
      const res = await c.client.conversations.replies({
        channel: c.event.channelId,
        ts: c.event.threadTs,
      });
      if (!res.ok) {
        return c.res.message(
          `リクエストに失敗したぞ: \`${res.error || "Unknown Error"}\``,
        );
      }
      messages = createChatConversations({
        messages: res.messages,
        authUserId: c.authUserId,
      });
    }
    const assistant = c.randomChoice(ASSISTANTS);
    messages.unshift({ role: "system", content: assistant.prompt });

    const resChat = await chatCompletions({
      apiKey: c.env.OPENAI_API_KEY,
      messages,
    });
    if (!resChat.ok) {
      return resChat?.isTimeout
        ? c.res.message(
          `${TIMEOUT_SECONDS}秒以内にChatGPTの応答がなかったのでタイムアウトしたぞ`,
        )
        : c.res.message(`リクエストに失敗したぞ: ${resChat.error}`);
    }
    const reply = resChat.value.choices[0]?.message.content;
    if (!reply) {
      return c.res.message("返事がないぞ");
    }
    return c.res.message(reply, {
      // 始めての返信の場合は、thread_broadcast で返信する (systemプロンプトを含むと閾値が3になる)
      isReplyBroadcast: messages.length < 3,
      threadTs: c.event.messageTs,
      username: assistant.name,
      iconEmoji: assistant.emoji,
    });
  },
  outgoingDomains: ["api.openai.com"],
});
