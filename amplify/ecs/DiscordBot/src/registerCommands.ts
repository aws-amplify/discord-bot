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
export const token = process.env.DISCORDBOT_TOKEN;
const applicationID = process.env.DISCORDBOT_APPLICATION_ID;

const rest = new REST().setToken(token as string);

export const registerCommands = async () => {
  console.log(applicationID);
  try {
    await rest.put(Routes.applicationCommands("872475355502493766"), {
      body: commandsData,
    });
  } catch (error) {
    console.log(error);
  }
};
