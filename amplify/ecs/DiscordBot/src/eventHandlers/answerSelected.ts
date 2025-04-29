import {
  //   type Interaction,
  //   type BaseInteraction,
  type MessageContextMenuCommandInteraction,
  //   GuildTextThreadManager,
  ThreadChannel,
} from "discord.js";
import { requestHandler } from "../requestHandler.js";
import { validateAnswer } from "../utils/validateAnswer.js";

export const answerSelected = async (
  interaction: MessageContextMenuCommandInteraction
) => {
  if (await validateAnswer(interaction)) {
    const channel: ThreadChannel = interaction.channel as ThreadChannel;

    /**
     * @TODO
     *
     * - Check if "user" exists in DB as `DiscordUser`, if not create one
     * - Add questions to `DiscordUser.answers[]`
     */

    try {
      const checkUser = await requestHandler({
        query: /* GraphQL */ `
          query GetUser($id: String!) {
            getDiscordUser(id: $id) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: interaction.targetMessage.author.id,
          },
        },
      });
      if (checkUser.res.data) {
        // add to user db
      } else {
        // create new user and add question
      }
      // await channel.setName(`✅ - ${channel.name}`);
    } catch (error) {
      console.log(error);
    }

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

    await requestHandler({ query, variables });

    interaction.reply(
      `Answer by ${interaction.targetMessage.author.displayName} has been selected`
    );
    return "Done";
  } else {
    interaction.reply(`Cannot select this answer.`);
  }
};
