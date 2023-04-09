import { createMentionCommand } from "gbas/mod.ts";

const SHOKUNINS = [
  "japanese_goblin",
  "japanese_ogre",
  "older_man",
  "robot_face",
  "alien",
  "frog",
  "fish",
];
const SUSHIS = [
  "sushi",
  "custard",
  "rock",
  "bomb",
  "cut_of_meat",
  "moneybag",
  "firecracker",
  "baby_bottle",
];

export const sushi = createMentionCommand({
  name: "sushi",
  examples: ["寿司 - 🍣"],
  pattern: /^(?:sushi|寿司)$/i,
  execute: (c) => {
    const shokunin = c.randomChoice(SHOKUNINS);
    const shina = c.randomChoice(SUSHIS);
    return c.res.message(`:palm_down_hand:  :${shina}:`, {
      iconEmoji: shokunin,
      username: "大将",
    });
  },
});
