import { Client, IntentsBitField, GatewayIntentBits, Events } from "discord.js";
import { threadCreated } from "./eventHandlers/threadCreated.js";
import { registerCommands } from "./registerCommands.js";
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
  ],
});

import { Hono } from "hono";

import { serve } from "@hono/node-server";
import { answerSelected } from "./eventHandlers/answerSelected.js";
import { threadUpdated } from "./eventHandlers/threadUpdate.js";
import { threadDeleted } from "./eventHandlers/threadDelete.js";

const app = new Hono();

app.get("/", (c) => c.text("Ping"));

serve(app);

export const token = process.env.DISCORDBOT_TOKEN;

client.login(token);

console.log("HELLO BOT");

client.on("ready", async () => {
  console.log("Bot is Ready!");
  registerCommands();
});

client.on(Events.ThreadCreate, async (thread) => {
  threadCreated(thread);
});

client.on(Events.ThreadUpdate, async (oldThread, newThread) => {
  threadUpdated(oldThread, newThread);
});

client.on(Events.ThreadDelete, async (thread) => {
  threadDeleted(thread);
});

client.on(Events.Error, (e) => {
  console.log("Error", e);
});
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  console.log(interaction.commandName);

  switch (interaction.commandName) {
    case "Select Answer":
      answerSelected(interaction);
      break;
    default:
      break;
  }
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

process.on("SIGINT", () => {
  console.log("destroying client");
  client?.destroy();
  process.exit(0);
});

process.on("exit", () => {
  console.log("destroying client");
  client?.destroy();
});
