import { AnyThreadChannel } from "discord.js";
import { REQUEST_TYPE, requestHandler } from "../requestHandler/index.js";

export const generateBedrockAnswer = async (thread: AnyThreadChannel) => {
  const query = /* GraphQL */ `
    query GenerateAnswer($prompt: String!) {
      generateAnswer(prompt: $prompt)
    }
  `;

  const starterMessage = await thread.fetchStarterMessage();
  const gen2Tag = thread.appliedTags.includes("gen2");
  const prompt = `${thread.name} ${starterMessage ? starterMessage : ""}${gen2Tag ? " #gen2" : ""} `;

  const variables = {
    prompt,
  };

  return await requestHandler(
    { query, variables },
    REQUEST_TYPE.GENERATE_ANSWER
  );
};
