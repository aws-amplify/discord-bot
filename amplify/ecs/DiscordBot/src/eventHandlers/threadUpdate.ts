import { ChannelType, type AnyThreadChannel } from "discord.js";
import { requestHandler } from "../requestHandler/index.js";
import { REQUEST_TYPE } from "../types.js";
import {
  ADD_QUESTION_MUTATION,
  UPDATE_QUESTION_MUTATION,
} from "../graphql/mutations.js";

let retryCount = 0;

export const threadUpdated = async (
  oldThread: AnyThreadChannel,
  newThread: AnyThreadChannel
) => {
  // Gather tags
  let tagsApplied = undefined;
  if (newThread?.parent?.type === ChannelType.GuildForum) {
    const appliedTagIds = newThread.appliedTags;
    // get all tags currently applied to the thread
    tagsApplied = newThread.parent.availableTags
      .filter((tag) => appliedTagIds.includes(tag.id))
      .map(({ name }) => name);
  }

  try {
    // UPDATE THE EXISTING THREAD
    const response = await requestHandler(
      {
        query: UPDATE_QUESTION_MUTATION,
        variables: {
          input: {
            id: oldThread.id,
            tags: JSON.stringify(tagsApplied),
          },
        },
      },
      REQUEST_TYPE.THREAD_UPDATE
    );

    // IF SOME ERROR (EX THREAD DOESN'T EXIST) CREATE THREAD INSTEAD
    if (response.data.errors !== null && retryCount < 1) {
      retryCount++;
      console.log(`=== retry ${retryCount}`);
      await requestHandler(
        {
          query: ADD_QUESTION_MUTATION,
          variables: {
            input: {
              title: newThread.name,
              url: newThread.url,
              id: newThread.id,
              tags: JSON.stringify(tagsApplied),
              answered: "no",
              createdAt: oldThread.createdAt,
            },
          },
        },
        REQUEST_TYPE.THREAD_UPDATE_RETRY
      );
    }
  } catch (e) {}
};
