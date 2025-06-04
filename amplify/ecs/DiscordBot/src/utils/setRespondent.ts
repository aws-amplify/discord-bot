import { MessageContextMenuCommandInteraction } from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { REQUEST_TYPE } from "../types.js";
import {
  CREATE_USER_MUTATION,
  UPDATE_USER_MUTATION,
} from "../graphql/mutations.js";
import { GET_USER_QUERY } from "../graphql/queries.js";

export const setRespondent = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  try {
    const getUser = await requestHandler(
      {
        query: GET_USER_QUERY,
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
    await requestHandler(
      {
        query: CREATE_USER_MUTATION,
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
    await requestHandler(
      {
        query: UPDATE_USER_MUTATION,
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
