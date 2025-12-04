-- Ajouter la colonne updatedAt à la table Notification si elle n'existe pas
ALTER TABLE "Notification"
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;