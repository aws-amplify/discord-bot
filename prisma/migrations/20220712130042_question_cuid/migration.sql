/*
  Warnings:

  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "threadMetaUpdatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT
);
INSERT INTO "new_Question" ("channelName", "createdAt", "id", "isSolved", "ownerId", "threadId", "threadMetaUpdatedAt", "title", "updatedAt", "url") SELECT "channelName", "createdAt", "id", "isSolved", "ownerId", "threadId", "threadMetaUpdatedAt", "title", "updatedAt", "url" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_threadId_key" ON "Question"("threadId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
