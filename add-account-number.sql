-- Ajouter la colonne accountNumber à la table Client
ALTER TABLE "Client"
ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;

-- Créer un index unique sur accountNumber
CREATE UNIQUE INDEX IF NOT EXISTS "Client_accountNumber_key" ON "Client"("accountNumber");

-- Mettre à jour les clients existants avec des numéros de compte uniques
UPDATE "Client"
SET "accountNumber" = 'ACC' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS TEXT), 8, '0')
WHERE "accountNumber" IS NULL;