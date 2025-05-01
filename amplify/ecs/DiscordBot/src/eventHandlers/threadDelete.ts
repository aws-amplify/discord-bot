import { ChannelType, type AnyThreadChannel } from "discord.js";
import { REQUEST_TYPE, requestHandler } from "../requestHandler/index.js";

export const threadDeleted = async (thread: AnyThreadChannel) => {
  const query = /* GraphQL */ `
    mutation AddQuestion($input: DeleteQuestionInput!) {
      deleteQuestion(input: $input) {
        id
      }
    }
  `;

  const variables = {
    input: {
      id: thread.id,
    },
  };

  try {
    await requestHandler({ query, variables }, REQUEST_TYPE.THREAD_DELETE);
  } catch (e) {}
};
