import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest";

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORDBOT_TOKEN as string
);

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("event", event);

  const response: Record<string, string | number | Record<string, string>> = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
  };

  try {
    const result = await rest.get(
      Routes.guildPreview(process.env.DISCORD_GUILD_ID as string)
    );
    console.log(result);
    response.body = JSON.stringify(result);
  } catch (error) {
    console.log(error);
    response.statusCode = 404;
    response.body = JSON.stringify("Couldn't find that");
  }

  return response;
};
