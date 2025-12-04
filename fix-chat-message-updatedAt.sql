-- Ajouter la colonne updatedAt à ChatMessage si elle n'existe pas
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Mettre à jour les valeurs existantes si nécessaire
UPDATE "ChatMessage" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Ajouter la contrainte NOT NULL
ALTER TABLE "ChatMessage" ALTER COLUMN "updatedAt" SET NOT NULL;