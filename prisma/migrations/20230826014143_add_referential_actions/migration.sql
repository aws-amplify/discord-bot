-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    CONSTRAINT "Participation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Participation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "DiscordUser" ("id") ON DELETE NO ACTION ON UPDATE CASCADE
);
INSERT INTO "new_Participation" ("id", "participantId", "questionId") SELECT "id", "participantId", "questionId" FROM "Participation";
DROP TABLE "Participation";
ALTER TABLE "new_Participation" RENAME TO "Participation";
CREATE UNIQUE INDEX "Participation_questionId_participantId_key" ON "Participation"("questionId", "participantId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
