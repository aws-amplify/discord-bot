import { ChannelType, type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { generateBedrockAnswer } from "../utils/generateBedrockAnswer.js";
import { REQUEST_TYPE } from "../types.js";
import { ADD_QUESTION_MUTATION } from "../graphql/mutations.js";

export const threadCreated = async (thread: AnyThreadChannel) => {
  try {
    // Gather tags
    let tagsApplied = undefined;
    if (thread?.parent?.type === ChannelType.GuildForum) {
      const appliedTagIds = thread.appliedTags;
      // get all tags currently applied to the thread
      tagsApplied = thread.parent.availableTags
        .filter((tag) => appliedTagIds.includes(tag.id))
        .map(({ name }) => name);
    }

    // Make GraphQL request
    await requestHandler(
      {
        query: ADD_QUESTION_MUTATION,
        variables: {
          input: {
            title: thread.name,
            url: thread.url,
            id: thread.id,
            createdAt: thread.createdAt,
            tags: JSON.stringify(tagsApplied),
            answered: "no",
          },
        },
      },
      REQUEST_TYPE.THREAD_CREATE
    );

    // Get initial GenAI response from Bedrock
    const message = await generateBedrockAnswer(thread);
    await thread.send(message.data.retrieveAndGenerate);
  } catch (e) {
    await thread.send("Something went wrong...");
  }
};
