/*
  Warnings:

  - Added the required column `channelName` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "threadId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT
);
INSERT INTO "new_Question" ("createdAt", "id", "isSolved", "ownerId", "threadId", "title", "url") SELECT "createdAt", "id", "isSolved", "ownerId", "threadId", "title", "url" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
CREATE UNIQUE INDEX "Question_threadId_key" ON "Question"("threadId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
