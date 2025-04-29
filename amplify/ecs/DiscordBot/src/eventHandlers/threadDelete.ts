import { ChannelType, type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler.js";

export const threadDeleted = async (thread: AnyThreadChannel) => {
  const query = /* GraphQL */ `
    mutation AddQuestion($input: CreateQuestionInput!) {
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
    await requestHandler({ query, variables });
  } catch (e) {
    console.log("delete request failed");
  }
};
