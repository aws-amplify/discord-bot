import {
  //   type Interaction,
  //   type BaseInteraction,
  type MessageContextMenuCommandInteraction,
  //   GuildTextThreadManager,
  ThreadChannel,
} from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { validateAnswer } from "../utils/validateAnswer.js";
import { setRespondent } from "../utils/setRespondent.js";
import { REQUEST_TYPE } from "../types.js";
import { UPDATE_QUESTION_MUTATION } from "../graphql/mutations.js";

export const answerSelected = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  if (await validateAnswer(interaction)) {
    const channel: ThreadChannel = interaction.channel as ThreadChannel;

    const userID = setRespondent(interaction);

    await requestHandler(
      {
        query: UPDATE_QUESTION_MUTATION,
        variables: {
          input: {
            id: interaction.channelId,

            answered: "yes",
            answer: interaction.targetMessage.author.id,
          },
        },
      },
      REQUEST_TYPE.ANSWER_SELECTED
    );

    await channel.setName(`✅ - ${channel.name}`);

    interaction.reply(
      `Answer by ${interaction.targetMessage.author.displayName} has been selected`
    );
    return "Done";
  } else {
    interaction.reply(`Cannot select this answer.`);
  }
};
