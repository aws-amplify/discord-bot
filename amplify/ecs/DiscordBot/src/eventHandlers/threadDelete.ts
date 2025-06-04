import { type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { REQUEST_TYPE } from "../types.js";
import { DELETE_QUESTION_MUTATION } from "../graphql/mutations.js";

export const threadDeleted = async (thread: AnyThreadChannel) => {
  try {
    // Make GraphQL Request
    await requestHandler(
      {
        query: DELETE_QUESTION_MUTATION,
        variables: {
          input: {
            id: thread.id,
          },
        },
      },
      REQUEST_TYPE.THREAD_DELETE
    );
  } catch (e) {}
};
