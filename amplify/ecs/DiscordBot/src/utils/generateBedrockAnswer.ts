import { AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { REQUEST_TYPE } from "../types.js";
import { RAG_QUERY } from "../graphql/queries.js";

export const generateBedrockAnswer = async (thread: AnyThreadChannel) => {
  // check if there is starter message to include in the prompt
  const starterMessage = await thread.fetchStarterMessage();

  // Check if the current thread has gen2 tag
  const gen2Tag = thread.appliedTags.includes("gen2");

  // Append either or both of starter message and #gen2 to prompt
  const prompt = `${thread.name} ${starterMessage ? starterMessage : ""}${gen2Tag ? " #gen2" : ""} `;

  return await requestHandler(
    {
      query: RAG_QUERY,
      variables: {
        prompt,
      },
    },
    REQUEST_TYPE.GENERATE_ANSWER
  );
};
