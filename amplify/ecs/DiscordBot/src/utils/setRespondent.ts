import { MessageContextMenuCommandInteraction } from "discord.js";
import { REQUEST_TYPE, requestHandler } from "../requestHandler/index.js";

export const setRespondent = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  try {
    const getUser = await requestHandler(
      {
        query: /* GraphQL */ `
          query GetUser($id: ID!) {
            getDiscordUser(id: $id) {
              id
              answers
            }
          }
        `,
        variables: {
          id: interaction.targetMessage.author.id,
        },
      },
      REQUEST_TYPE.GET_USER
    );

    if (getUser.data.getDiscordUser !== null) {
      await updateUser(interaction, getUser.data.getDiscordUser.answers);
    } else {
      await createUser(interaction);
    }
    // User exists, update to add new answer
    // await updateUser(interaction,getUser.)
    return;
  } catch (error) {
    // User doesn't exist
    // await createUser(interaction);
  }
};

const createUser = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  try {
    const newUser = await requestHandler(
      {
        query: /* GraphQL */ `
          mutation CreateUser($input: CreateDiscordUserInput!) {
            createDiscordUser(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: interaction.targetMessage.author.id,
            name: interaction.targetMessage.author.username,
            answers: [interaction.targetMessage.id],
          },
        },
      },
      REQUEST_TYPE.CREATE_USER
    );

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};

const updateUser = async (
  interaction: MessageContextMenuCommandInteraction,
  answers: string
) => {
  try {
    const updateUser = await requestHandler(
      {
        query: /* GraphQL */ `
          mutation UpdateUser($input: UpdateDiscordUserInput!) {
            updateDiscordUser(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: interaction.targetMessage.author.id,
            name: interaction.targetMessage.author.username,
            answers: [answers, interaction.targetMessage.id],
          },
        },
      },
      REQUEST_TYPE.UPDATE_USER
    );

    return;
  } catch (e) {
    console.error(e);
    return;
  }
};
