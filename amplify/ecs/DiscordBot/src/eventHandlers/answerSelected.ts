import {
  //   type Interaction,
  //   type BaseInteraction,
  type MessageContextMenuCommandInteraction,
  //   GuildTextThreadManager,
  ThreadChannel,
} from "discord.js";
import { REQUEST_TYPE, requestHandler } from "../requestHandler/index.js";
import { validateAnswer } from "../utils/validateAnswer.js";
import { setRespondent } from "../utils/setRespondent.js";

export const answerSelected = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  if (await validateAnswer(interaction)) {
    const channel: ThreadChannel = interaction.channel as ThreadChannel;

    const userID = setRespondent(interaction);

    const query = /* GraphQL */ `
      mutation UpdateQuestion($input: UpdateQuestionInput!) {
        updateQuestion(input: $input) {
          id
        }
      }
    `;

    const variables = {
      input: {
        id: interaction.channelId,

        answered: "yes",
        answer: interaction.targetMessage.author.id,
      },
    };

    await requestHandler({ query, variables }, REQUEST_TYPE.ANSWER_SELECTED);

    await channel.setName(`✅ - ${channel.name}`);

    interaction.reply(
      `Answer by ${interaction.targetMessage.author.displayName} has been selected`
    );
    return "Done";
  } else {
    interaction.reply(`Cannot select this answer.`);
  }
};
