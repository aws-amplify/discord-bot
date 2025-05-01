/**
 * 1. Check if the person selecting is staff/admin/or origin author to thread
 * 2. Check if answer is by bot
 * 3. Check if thread is already answered
 *
 * ex: await validateAnswer(interaction):Boolean
 */

import { MessageContextMenuCommandInteraction } from "discord.js";

export const validateAnswer = async (
  interaction: MessageContextMenuCommandInteraction
): Promise<boolean> => {
  // TODO: Add validation logic
  return true;
};
