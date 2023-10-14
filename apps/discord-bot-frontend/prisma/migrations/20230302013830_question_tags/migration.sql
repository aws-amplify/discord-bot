/*
  Warnings:

  - You are about to drop the column `tagId` on the `Question` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_QuestionToQuestionTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_QuestionToQuestionTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_QuestionToQuestionTag_B_fkey" FOREIGN KEY ("B") REFERENCES "QuestionTag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "threadId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "threadMetaUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "guildId" TEXT NOT NULL,
    "githubDiscussionId" TEXT,
    CONSTRAINT "Question_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Question_githubDiscussionId_fkey" FOREIGN KEY ("githubDiscussionId") REFERENCES "GitHubDiscussion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Question" ("channelName", "createdAt", "githubDiscussionId", "guildId", "id", "isSolved", "ownerId", "threadId", "threadMetaUpdatedAt", "title", "updatedAt", "url") SELECT "channelName", "createdAt", "githubDiscussionId", "guildId", "id", "isSolved", "ownerId", "threadId", "threadMetaUpdatedAt", "title", "updatedAt", "url" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_threadId_key" ON "Question"("threadId");
CREATE UNIQUE INDEX "Question_githubDiscussionId_key" ON "Question"("githubDiscussionId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToQuestionTag_AB_unique" ON "_QuestionToQuestionTag"("A", "B");

-- CreateIndex
CREATE INDEX "_QuestionToQuestionTag_B_index" ON "_QuestionToQuestionTag"("B");
