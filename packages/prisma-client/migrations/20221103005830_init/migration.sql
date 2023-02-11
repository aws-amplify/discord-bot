-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Question" (
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
    "tagId" TEXT,
    CONSTRAINT "Question_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Question_githubDiscussionId_fkey" FOREIGN KEY ("githubDiscussionId") REFERENCES "GitHubDiscussion" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Question_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "QuestionTag" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Participation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    CONSTRAINT "Participation_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordRole" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "DiscordUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT,
    CONSTRAINT "DiscordUser_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    CONSTRAINT "EventSchedule_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventSchedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "location" TEXT,
    "start" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "scheduleId" TEXT,
    "eventScheduleId" TEXT NOT NULL,
    CONSTRAINT "DiscordEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscordEvent_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "EventSchedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscordEventAttendee" (
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "time" INTEGER NOT NULL,
    CONSTRAINT "DiscordEventAttendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DiscordEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscordEventAttendee_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GitHubDiscussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "selectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selectedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "questionId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,
    CONSTRAINT "Answer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "DiscordUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Answer_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "Participation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccessLevel" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "AccessLevelRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessLevelId" TEXT NOT NULL,
    "configurationId" TEXT,
    "discordRoleId" TEXT NOT NULL,
    CONSTRAINT "AccessLevelRole_accessLevelId_fkey" FOREIGN KEY ("accessLevelId") REFERENCES "AccessLevel" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccessLevelRole_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AccessLevelRole_discordRoleId_fkey" FOREIGN KEY ("discordRoleId") REFERENCES "DiscordRole" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "githubOrganization" TEXT,
    CONSTRAINT "Configuration_id_fkey" FOREIGN KEY ("id") REFERENCES "Guild" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigurationFeature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configurationId" TEXT NOT NULL,
    "featureCode" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "ConfigurationFeature_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "Configuration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ConfigurationFeature_featureCode_fkey" FOREIGN KEY ("featureCode") REFERENCES "Feature" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Feature" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featureTypeCode" TEXT NOT NULL,
    CONSTRAINT "Feature_featureTypeCode_fkey" FOREIGN KEY ("featureTypeCode") REFERENCES "FeatureType" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeatureType" (
    "code" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "FeatureInputs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "featureCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secure" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FeatureInputs_featureCode_fkey" FOREIGN KEY ("featureCode") REFERENCES "Feature" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "refresh_token_expires_in" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_DiscordRoleToParticipation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_DiscordRoleToParticipation_A_fkey" FOREIGN KEY ("A") REFERENCES "DiscordRole" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DiscordRoleToParticipation_B_fkey" FOREIGN KEY ("B") REFERENCES "Participation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_id_key" ON "Guild"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Question_threadId_key" ON "Question"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_githubDiscussionId_key" ON "Question"("githubDiscussionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_name_key" ON "QuestionTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Participation_questionId_participantId_key" ON "Participation"("questionId", "participantId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordRole_id_key" ON "DiscordRole"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordUser_id_key" ON "DiscordUser"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordUser_accountId_key" ON "DiscordUser"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordEvent_id_key" ON "DiscordEvent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscordEventAttendee_eventId_memberId_key" ON "DiscordEventAttendee"("eventId", "memberId");

-- CreateIndex
CREATE UNIQUE INDEX "GitHubDiscussion_id_key" ON "GitHubDiscussion"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_questionId_key" ON "Answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_participationId_key" ON "Answer"("participationId");

-- CreateIndex
CREATE UNIQUE INDEX "AccessLevelRole_discordRoleId_key" ON "AccessLevelRole"("discordRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_id_key" ON "Configuration"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigurationFeature_configurationId_featureCode_key" ON "ConfigurationFeature"("configurationId", "featureCode");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_code_key" ON "Feature"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureType_code_key" ON "FeatureType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "_DiscordRoleToParticipation_AB_unique" ON "_DiscordRoleToParticipation"("A", "B");

-- CreateIndex
CREATE INDEX "_DiscordRoleToParticipation_B_index" ON "_DiscordRoleToParticipation"("B");
