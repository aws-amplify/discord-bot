import { REST } from "@discordjs/rest";
import { Routes, RESTGetAPIGuildPreviewResult } from "discord-api-types/rest";
import type { Schema } from "../../data/resource";

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN as string
);

export const handler: Schema["serverStats"]["functionHandler"] = async (
  event
) => {
  try {
    const result = (await rest.get(
      Routes.guildPreview(process.env.DISCORD_GUILD as string)
    )) as RESTGetAPIGuildPreviewResult;

    return {
      members: result.approximate_member_count,
      presence: result.approximate_presence_count,
    };
  } catch (error) {
    console.error(error);

    return {
      members: 0,
      presence: 0,
    };
  }
};
