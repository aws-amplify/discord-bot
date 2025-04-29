import { ChannelType, type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler.js";

let retryCount = 0;

export const threadUpdated = async (
  oldThread: AnyThreadChannel,
  newThread: AnyThreadChannel
) => {
  console.log("handling thread update - created at", oldThread.createdAt);

  console.log({ oldThread });
  const updateQuery = /* GraphQL */ `
    mutation UpdateQuestion($input: UpdateQuestionInput!) {
      updateQuestion(input: $input) {
        id
      }
    }
  `;

  const createQuery = /* GraphQL */ `
    mutation AddQuestion($input: CreateQuestionInput!) {
      createQuestion(input: $input) {
        id
      }
    }
  `;

  // capture tags (only applies to forum channel posts)
  let tagsApplied = undefined;
  //   let tagsRemoved = undefined;
  if (newThread?.parent?.type === ChannelType.GuildForum) {
    const appliedTagIds = newThread.appliedTags;
    // get all tags currently applied to the thread
    tagsApplied = newThread.parent.availableTags
      .filter((tag) => appliedTagIds.includes(tag.id))
      .map(({ name }) => name);
  }

  console.log("new tags", tagsApplied);

  const updateVariables = {
    input: {
      id: oldThread.id,
      tags: JSON.stringify(tagsApplied),
    },
  };

  const createVariables = {
    input: {
      title: newThread.name,
      url: newThread.url,
      id: newThread.id,
      tags: JSON.stringify(tagsApplied),
      answered: "no",
      createdAt: oldThread.createdAt,
    },
  };

  try {
    const response = await requestHandler({
      query: updateQuery,
      variables: updateVariables,
    });
    if (response.data.errors !== null && retryCount < 1) {
      retryCount++;
      console.log(`=== retry ${retryCount}`);
      await requestHandler({
        query: createQuery,
        variables: createVariables,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
