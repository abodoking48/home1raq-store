-- CreateEnum
CREATE TYPE "TelegramDraftStatus" AS ENUM ('PENDING', 'PUBLISHING', 'PUBLISHED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TelegramPhoto" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" INTEGER NOT NULL,
    "mediaGroupId" TEXT,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelegramPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelegramDraft" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "sourceMessageId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "categoryId" TEXT,
    "fileIds" TEXT[],
    "status" "TelegramDraftStatus" NOT NULL DEFAULT 'PENDING',
    "productSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TelegramDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TelegramPhoto_chatId_messageId_key" ON "TelegramPhoto"("chatId", "messageId");

-- CreateIndex
CREATE INDEX "TelegramPhoto_chatId_mediaGroupId_idx" ON "TelegramPhoto"("chatId", "mediaGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "TelegramDraft_chatId_sourceMessageId_key" ON "TelegramDraft"("chatId", "sourceMessageId");
