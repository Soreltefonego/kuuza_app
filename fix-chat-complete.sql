-- 1. Ajouter la colonne updatedAt à ChatMessage si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'ChatMessage'
        AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "ChatMessage" ADD COLUMN "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;

        -- Mettre à jour les valeurs existantes
        UPDATE "ChatMessage" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
    END IF;
END $$;

-- 2. Créer les tables de chat si elles n'existent pas
CREATE TABLE IF NOT EXISTS "ChatConversation" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "managerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subject" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- 3. Créer les index si ils n'existent pas
CREATE INDEX IF NOT EXISTS "ChatConversation_clientId_idx" ON "ChatConversation"("clientId");
CREATE INDEX IF NOT EXISTS "ChatConversation_managerId_idx" ON "ChatConversation"("managerId");
CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
CREATE INDEX IF NOT EXISTS "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX IF NOT EXISTS "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt" DESC);

-- 4. Ajouter les contraintes de clés étrangères si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE constraint_name = 'ChatConversation_clientId_fkey'
    ) THEN
        ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_clientId_fkey"
        FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE constraint_name = 'ChatConversation_managerId_fkey'
    ) THEN
        ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_managerId_fkey"
        FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE constraint_name = 'ChatMessage_conversationId_fkey'
    ) THEN
        ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_conversationId_fkey"
        FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE constraint_name = 'ChatMessage_senderId_fkey'
    ) THEN
        ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey"
        FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;