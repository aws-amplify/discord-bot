/*
  Warnings:

  - A unique constraint covering the columns `[id,name]` on the table `QuestionTag` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "QuestionTag_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_id_name_key" ON "QuestionTag"("id", "name");
