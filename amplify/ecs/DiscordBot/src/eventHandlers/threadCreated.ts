import { ChannelType, type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler.js";

export const threadCreated = async (thread: AnyThreadChannel) => {
  const query = /* GraphQL */ `
    mutation AddQuestion($input: CreateQuestionInput!) {
      createQuestion(input: $input) {
        id
      }
    }
  `;

  let tagsApplied = undefined;

  if (thread?.parent?.type === ChannelType.GuildForum) {
    const appliedTagIds = thread.appliedTags;
    // get all tags currently applied to the thread
    tagsApplied = thread.parent.availableTags
      .filter((tag) => appliedTagIds.includes(tag.id))
      .map(({ name }) => name);
  }

  console.log(tagsApplied);
  const variables = {
    input: {
      title: thread.name,
      url: thread.url,
      id: thread.id,
      createdAt: thread.createdAt,
      tags: JSON.stringify(tagsApplied),
      answered: "no",
      //   updatedAt: "AWSDateTime",
    },
  };

  await requestHandler({ query, variables });
};
