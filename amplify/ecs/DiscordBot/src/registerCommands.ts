import {
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  REST,
  Routes,
} from "discord.js";
const commandsData = [
  new ContextMenuCommandBuilder()
    .setName("Select Answer")
    .setType(ApplicationCommandType.Message),
];
export const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT;

const rest = new REST().setToken(token as string);

export const registerCommands = async () => {
  console.log(clientId);
  if (clientId) {
    try {
      await rest.put(Routes.applicationCommands(clientId as string), {
        body: commandsData,
      });
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("no client id - failed to register commands");
  }
};
